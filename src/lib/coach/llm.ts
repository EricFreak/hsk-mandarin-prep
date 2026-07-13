import OpenAI from "openai";

export function getCoachLLM(): OpenAI | null {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
  });
}

export function getCoachModel(): string {
  return process.env.COACH_LLM_MODEL ?? "deepseek-chat";
}

export function isCoachLLMConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}
