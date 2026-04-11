// Environment configuration for interview feature
export const interviewConfig = {
  AI_BACKEND_BASE_URL: 'http://localhost:8000',
  API_ENDPOINTS: {
    generateQuestions: 'http://localhost:8000/api/v1/interview/generate-questions',
  },

  ASSEMBLYAI_API_KEY: (import.meta.env.VITE_ASSEMBLYAI_API_KEY as string) || '',

  MAX_RECORDING_DURATION: 300, // 5 minutes
  TRANSCRIPTION_TIMEOUT: 300000, // 5 minutes
  SUPPORTED_AUDIO_FORMATS: ['audio/wav', 'audio/mp3', 'audio/webm'],

  DIFFICULTY_LEVELS: ['beginner', 'intermediate', 'advanced'] as const,
  ROUND_TYPES: ['technical', 'behavioral', 'system-design'],
} as const;

export type RoundType = (typeof interviewConfig.ROUND_TYPES)[number];
