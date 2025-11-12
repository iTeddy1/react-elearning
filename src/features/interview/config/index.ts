// Environment configuration for interview feature
export const interviewConfig = {
  GOOGLE_GENAI_API_KEY: import.meta.env.VITE_GOOGLE_GENAI_API_KEY as string,
  AI_MODEL: 'gemini-2.5-flash',

  ASSEMBLYAI_API_KEY: (import.meta.env.VITE_ASSEMBLYAI_API_KEY as string) || '',

  MAX_RECORDING_DURATION: 300, // 5 minutes
  TRANSCRIPTION_TIMEOUT: 300000, // 5 minutes
  SUPPORTED_AUDIO_FORMATS: ['audio/wav', 'audio/mp3', 'audio/webm'],

  DIFFICULTY_LEVELS: ['beginner', 'intermediate', 'advanced'] as const,
  ROUND_TYPES: ['technical', 'behavioral', 'system-design'],
} as const;

export type RoundType = (typeof interviewConfig.ROUND_TYPES)[number];
