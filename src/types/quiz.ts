import { Difficulty, DateString, Language } from './common';

// AI Generated Quiz Types (matching res.json structure)
export interface AIQuizMeta {
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  numQuestions: number;
}

export interface AIQuizItem {
  id: string;
  question: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
  tags: string[];
}

export interface AIQuizOverall {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestedTopics: string[];
  studyTips: string[];
  estimatedLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface AIGeneratedQuizResponse {
  meta: AIQuizMeta;
  items: AIQuizItem[];
  overall: AIQuizOverall;
}

// Internal Quiz Types
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
  tags?: string[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  questions: QuizQuestion[];
  timeLimit: number; // in minutes
  topicId?: number; // Related learning topic
  aiGenerated?: boolean;
  aiMeta?: AIQuizMeta;
  aiOverall?: AIQuizOverall;
}

// Quiz Attempt and Answer Types
export interface QuizAnswer {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number;
}

export interface BaseQuizAttempt {
  id: number;
  quizId: number;
  score: number;
  completedAt: DateString;
  timeSpent: number; // in seconds
  topicId?: number;
  topicName?: string;
  difficulty?: Difficulty;
}

export interface QuizAttempt extends BaseQuizAttempt {
  answers: QuizAnswer[];
  totalQuestions: number;
  percentage: number;
}

// Quiz Generation Input
export interface GenerateQuizInput {
  topic: string;
  difficulty: Difficulty;
  questionCount: number;
  language?: Language;
}

// Quiz Review and Analytics
export interface QuizReview {
  score: number;
  total: number;
  accuracy: number; // 0..1
  perTagAccuracy: Record<string, number>;
  comment: string; // nhận xét tổng quan
  recommendedTopics: string[]; // gợi ý dựa trên tag trả lời sai
  tips: string[];
}

// Progress Tracking Types
export interface UserProgress {
  totalQuizzesCompleted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number; // in seconds
  streakCount: number;
  lastQuizDate: Date | null;
}

export interface TopicProgress {
  topicId: number;
  topicName: string;
  quizzesCompleted: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  lastAttemptDate: Date | null;
}

// Achievement Types
export interface Achievement {
  type: string;
  title: string;
  description: string;
  unlockedAt: Date;
}

// Quiz Statistics
export interface QuizStatistics {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  averageTimeSpent: number;
  passingRate: number; // percentage of attempts with score >= 70%
}

// Export Progress Data
export interface ExportedProgressData {
  userProgress: UserProgress;
  topicProgress: TopicProgress[];
  quizAttempts: QuizAttempt[];
  exportedAt: DateString;
  version: string;
}
