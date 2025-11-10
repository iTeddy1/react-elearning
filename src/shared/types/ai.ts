/**
 * Common types used across AI services
 */

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Language = 'en' | 'vi';

export interface BaseQuestion {
  id: string;
  question: string;
  difficulty: Difficulty;
}

export interface GenerationOptions {
  difficulty: Difficulty;
  numberOfQuestions: number;
  language?: Language;
}

export interface AIConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  finishReason?: string;
}

// Common AI service error types
export interface AIError {
  code: string;
  message: string;
  details?: unknown;
}

// Speech recognition types
export interface SpeechConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface AIGeneratedContent {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface FeedbackResponse {
  score: number;
  feedback: string;
  suggestions: string[];
  strengths?: string[];
  weaknesses?: string[];
}
