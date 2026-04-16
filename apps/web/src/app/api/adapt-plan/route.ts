import { NextRequest, NextResponse } from 'next/server';
import { generateWithRetry } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  const { current_plan, user_request } = await request.json();

  const prompt = `
You are an AI fitness assistant. Your task is to modify a JSON workout plan based on a user's request.
The user's request is: "${user_request}"

Here is the current workout plan in JSON format:
${JSON.stringify(current_plan, null, 2)}

Your instructions are:
1.  Read the user's request and the JSON data carefully.
2.  Modify the JSON data to fulfill the user's request.
3.  **You must return the complete, entire, updated JSON object.** Do not return only the changed parts.
4.  The structure of the JSON object must remain exactly the same as the original. Do not add, remove, or rename any keys at the top level of the JSON structure unless the user explicitly asks for it.
5.  Ensure the returned JSON is valid.
6.  Do not add any explanatory text, comments, or markdown formatting. Your response must be **only the raw JSON object**.

For example, if the user says "remove the barbell bench press from day 1", you should find that exercise in the \`workouts\` array and remove it, then return the whole JSON object.
If the user says "make day 2 a rest day", you should modify the components of the workout for day 2 to reflect a rest day (e.g., empty arrays for components).

Now, generate the updated JSON plan.
`;

  try {
    const rawText = await generateWithRetry(prompt);
    const cleaned = rawText.trim().replace(/`/g, '').replace(/json/g, '');
    const updatedPlan = JSON.parse(cleaned);
    return NextResponse.json({ updated_plan: updatedPlan });
  } catch (error: any) {
    return NextResponse.json(
      { detail: `AI failed to return valid JSON. Error: ${error.message}` },
      { status: 500 }
    );
  }
}
