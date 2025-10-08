// Practice feature configuration
export const practiceConfig = {
  // AI Configuration
  GOOGLE_GENAI_API_KEY: import.meta.env.VITE_GOOGLE_GENAI_API_KEY as string,
  AI_MODEL: 'gemini-2.5-flash',

  // Quiz Configuration
  DEFAULT_QUESTION_COUNT: 10,
  MIN_QUESTION_COUNT: 5,
  MAX_QUESTION_COUNT: 50,
  DEFAULT_TIME_LIMIT: 30, // minutes

  // Difficulty Levels
  DIFFICULTY_LEVELS: ['beginner', 'intermediate', 'advanced'] as const,

  // Supported Languages
  LANGUAGES: {
    en: 'English',
    vi: 'Vietnamese',
  } as const,

  // Score Thresholds
  SCORE_THRESHOLDS: {
    excellent: 90,
    good: 75,
    average: 60,
    needsImprovement: 40,
  },

  // Review Configuration
  REVIEW_GENERATION_TIMEOUT: 60000, // 1 minute

  // Local Storage Keys
  STORAGE_KEYS: {
    userProgress: 'practice_user_progress',
    recentSessions: 'practice_recent_sessions',
    preferences: 'practice_preferences',
  },

  // API Endpoints (if using external APIs)
  API_ENDPOINTS: {
    generateQuiz: '/api/practice/generate-quiz',
    generateReview: '/api/practice/generate-review',
    saveSession: '/api/practice/save-session',
    getUserProgress: '/api/practice/user-progress',
  },
} as const;

// Type exports for configuration
export type SupportedLanguage = keyof typeof practiceConfig.LANGUAGES;
export type DifficultyLevel = (typeof practiceConfig.DIFFICULTY_LEVELS)[number];

// Validation helpers
export const validateQuestionCount = (count: number): boolean => {
  return (
    count >= practiceConfig.MIN_QUESTION_COUNT &&
    count <= practiceConfig.MAX_QUESTION_COUNT
  );
};

export const validateDifficulty = (
  difficulty: string
): difficulty is DifficultyLevel => {
  return practiceConfig.DIFFICULTY_LEVELS.includes(
    difficulty as DifficultyLevel
  );
};

export const validateLanguage = (
  language: string
): language is SupportedLanguage => {
  return Object.keys(practiceConfig.LANGUAGES).includes(language);
};
