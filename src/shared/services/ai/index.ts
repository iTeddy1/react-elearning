import { BaseAIService, AIConfig } from './base-ai-service';

/**
 * Shared AI configuration and client instance
 */
export const AI_CONFIG: AIConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY as string,
  model: 'gemini-2.5-flash',
};

/**
 * Shared AI client instance
 */
export const createAIService = () => new BaseAIService(AI_CONFIG);

