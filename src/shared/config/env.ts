import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  VITE_GOOGLE_GENAI_API_KEY: z
    .string()
    .min(1, 'GOOGLE_GENAI_API_KEY is required'),
});

export type Env = z.infer<typeof envSchema>;
