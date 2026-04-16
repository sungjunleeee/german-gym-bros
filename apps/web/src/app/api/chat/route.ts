import { NextRequest } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';
import { createExerciseLibrary, weeklyPlan, exportProgramToText } from '@/lib/engine';

export async function POST(request: NextRequest) {
  const { message, state } = await request.json();
  const history: Array<{ role: string; parts: string[] }> = state?.history || [];

  if (!history.length) {
    const initialMessage =
      "Hi, I am your AI fitness programming assistant. I am going to ask a series of questions to hone your squad's workout plan to their needs.\n\nWhat test are you preparing for (e.g., ACFT) and what is the date of that test?";
    history.push({ role: 'model', parts: [initialMessage] });
    return Response.json({
      message: initialMessage,
      state: { history },
    });
  }

  history.push({ role: 'user', parts: [message] });

  const prompt = `The following is a conversation with an AI fitness programming assistant.
The assistant asks questions to create a personalized workout plan.

Based on the conversation, either ask the next clarifying question, or if you have enough information,
respond with a JSON object containing the following keys:
- "test_name": string (e.g., "ACFT")
- "test_date": string (YYYY-MM-DD)
- "days_per_week": int (3-5)
- "high_level_focus": 'strength' or 'cardio'
- "strength_focus": 'endurance', 'hypertrophy', 'power', or 'strength' (or null if cardio)
- "muscle_target": list of strings (e.g., ["chest", "back", "legs"])
- "equipment": list of strings (e.g., ["barbell", "dumbbell"])
- "num_soldiers": int

IMPORTANT RULES:
- Ask only ONE question at a time. Never ask multiple questions in a single message.
- Keep your responses short and conversational (1-2 sentences max).
- Do not ask for information you already have.
- UNTIL THE FINAL MESSAGE, RESPOND IN PLAIN TEXT WITH NO METADATA.

Here is the conversation history:
${JSON.stringify(history, null, 2)}
`;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const geminiResponse = await generateWithRetry(prompt, 3, (statusMsg) => {
          send('status', { status: statusMsg });
        });

        // Check if the response is the final JSON
        try {
          const cleaned = geminiResponse.trim().replace(/`/g, '').replace(/json/g, '');
          const planDataJson = JSON.parse(cleaned);

          const exerciseLib = createExerciseLibrary();
          const weekPlan = weeklyPlan(planDataJson, exerciseLib);
          const programText = exportProgramToText(weekPlan, planDataJson.strength_focus || 'hypertrophy');
          const planData = weekPlan.map((day) => ({ ...day }));

          const finalMessage = "I've generated a custom workout plan for your squad based on your requirements.";
          history.push({ role: 'model', parts: [finalMessage] });

          send('done', {
            message: finalMessage,
            state: { history },
            is_complete: true,
            plan: programText,
            plan_data: planData,
          });
        } catch {
          history.push({ role: 'model', parts: [geminiResponse] });
          send('done', {
            message: geminiResponse,
            state: { history },
          });
        }
      } catch (error: any) {
        send('error', { detail: `Error calling Gemini API: ${error.message}` });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
