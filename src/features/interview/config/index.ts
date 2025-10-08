// Environment configuration for interview feature
export const interviewConfig = {
  AI_INTERVIEW_API_BASE: (import.meta.env.VITE_GOOGLE_GENAI_API_KEY as string) || 'https://api.example.com',
  ASSEMBLYAI_API_KEY: (import.meta.env.VITE_ASSEMBLYAI_API_KEY as string) || '',
  MAX_RECORDING_DURATION: 300, // 5 minutes
  TRANSCRIPTION_TIMEOUT: 300000, // 5 minutes
  SUPPORTED_AUDIO_FORMATS: ['audio/wav', 'audio/mp3', 'audio/webm'],
} as const;

// API Response Types
export interface GenerateQuestionsResponse {
  questions: Array<{
    id: string;
    text: string;
    category?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }>;
  success: boolean;
  message?: string;
}

export interface UploadAudioResponse {
  upload_url: string;
}

export interface RequestTranscriptionResponse {
  id: string;
}

export interface TranscriptionStatusResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  error?: string;
}