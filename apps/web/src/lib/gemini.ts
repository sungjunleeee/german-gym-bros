import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

let _model: GenerativeModel | null = null;

export function getModel(): GenerativeModel {
  if (!_model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable not set');
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    _model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview' });
  }
  return _model;
}

// Rolling window rate limiter: max 12 requests per 60s (stay under the 15 RPM free tier limit for gemini-3.1-flash-lite)
const MAX_REQUESTS_PER_WINDOW = 12;
const WINDOW_MS = 60_000;
const requestTimestamps: number[] = [];

async function waitForRateLimit(onStatus?: (msg: string) => void): Promise<void> {
  const now = Date.now();
  while (requestTimestamps.length && requestTimestamps[0] <= now - WINDOW_MS) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const waitMs = requestTimestamps[0] + WINDOW_MS - now + 500;
    const waitSec = Math.ceil(waitMs / 1000);
    onStatus?.(`Rate limit reached — waiting ${waitSec}s before sending request...`);
    await new Promise((r) => setTimeout(r, waitMs));
  }

  requestTimestamps.push(Date.now());
}

export async function generateWithRetry(
  prompt: string,
  maxRetries: number = 3,
  onStatus?: (msg: string) => void
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await waitForRateLimit(onStatus);
      onStatus?.('Generating response...');
      const response = await getModel().generateContent(prompt);
      return response.response.text();
    } catch (error: any) {
      const msg = String(error?.message ?? '');
      const isRetryable = msg.includes('429') || msg.includes('503');

      if (isRetryable && attempt < maxRetries - 1) {
        onStatus?.(`Server busy — retrying in 60s (attempt ${attempt + 2}/${maxRetries})...`);
        await new Promise((r) => setTimeout(r, WINDOW_MS));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
