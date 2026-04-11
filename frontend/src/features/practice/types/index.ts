// Practice Quiz Types
export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface Quiz {
  id: number;
  title: string;
  topic: string;
  topicId: number;
  technology: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: QuizQuestion[];
  timeLimit?: number;
  createdAt: Date;
}

export interface QuizAnswer {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number;
}

// Quiz Session Types (enhanced)
export interface EnhancedQuizSession {
  id: string;
  quizId: number;
  userId?: string;
  startedAt: Date;
  completedAt?: Date;
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  status: 'active' | 'completed' | 'abandoned';
  timeSpent: number; // in seconds
  score?: number;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
  };
}

// Enhanced User Progress Types
export interface EnhancedUserProgress {
  userId: string;
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  timeSpent: number; // total time in seconds
  streakCurrent: number;
  streakBest: number;
  lastActivityAt: Date;
  skillLevels: {
    [technology: string]: {
      level: 'beginner' | 'intermediate' | 'advanced';
      experience: number;
      lastAssessed: Date;
    };
  };
  serverAchievements: {
    id: string;
    unlockedAt: Date;
    category: 'score' | 'streak' | 'completion' | 'speed';
  }[];
  preferences: {
    defaultDifficulty: 'beginner' | 'intermediate' | 'advanced';
    preferredLanguage: 'en' | 'vi';
    autoStartQuiz: boolean;
    showExplanations: boolean;
  };
}

export interface QuizAttempt {
  id: string;
  quizId: number;
  score: number;
  completedAt: Date;
  startedAt: Date;
  timeSpent: number;
  answers: QuizAnswer[];
  totalQuestions: number;
  percentage: number;
  topicId: number;
  topicName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizSession {
  id: string;
  quizId: number;
  userId?: string;
  answers: QuizAnswer[];
  score: number;
  percentage: number;
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number;
}

export interface QuizReview {
  sessionId: string;
  technology: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  detailedFeedback: string;
  nextTopics: string[];
  score: number;
  total: number;
  accuracy: number;
  perTagAccuracy: Record<string, number>;
  comment?: string;
  recommendedTopics?: string[];
  tips?: string[];
}

// Local API Response Types
export interface QuizGenerateApiItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizGenerateApiResponse {
  quiz: QuizGenerateApiItem[];
}

// Legacy AI Quiz Types (Gemini-era shape)
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

// Progress Tracking Types
export interface UserProgress {
  userId: string;
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  topicProgress: TopicProgress[];
  recentSessions: QuizSession[];
  achievements: Achievement[];
}

export interface TopicProgress {
  topic: string;
  technology: string;
  quizzesCompleted: number;
  averageScore: number;
  bestScore: number;
  lastActivity: Date;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: 'score' | 'streak' | 'completion' | 'improvement';
}

// Store State Types
export interface QuizGeneratorState {
  isGenerating: boolean;
  error: string | null;
  lastGeneratedQuiz: Quiz | null;
}

export interface QuizSessionState {
  currentSession: QuizSession | null;
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  timeRemaining: number;
  isActive: boolean;
  isPaused: boolean;
}

export interface QuizReviewState {
  currentReview: QuizReview | null;
  isGenerating: boolean;
  error: string | null;
}

export interface ProgressState {
  userProgress: UserProgress | null;
  isLoading: boolean;
  error: string | null;
}
