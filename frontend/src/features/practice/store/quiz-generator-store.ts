import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Quiz, QuizQuestion } from '../types';

export interface GenerateQuizInput {
  topic: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  language?: 'en' | 'vi';
}

// Helper function to convert AI questions to Quiz format
// Exported for use in React Query mutations
export const convertQuestionsToQuiz = (
  questions: QuizQuestion[],
  input: GenerateQuizInput
): Quiz => {
  return {
    id: Date.now(), // Generate unique ID
    title: `${input.technology} ${input.topic} - ${input.difficulty} Quiz`,
    topic: input.topic,
    topicId: 1, // You may want to generate this or get it from input
    technology: input.technology,
    difficulty: input.difficulty.toLowerCase() as
      | 'beginner'
      | 'intermediate'
      | 'advanced',
    timeLimit: input.questionCount * 2, // 2 minutes per question
    questions: questions,
    createdAt: new Date(),
  };
};

export interface QuizGeneratorState {
  // Generation state
  isGenerating: boolean;
  generatedQuiz: Quiz | null;
  generationError: string | null;

  // Generation settings
  defaultSettings: GenerateQuizInput;
  lastGeneratedSettings: GenerateQuizInput | null;

  // Generation history
  generationHistory: Array<{
    settings: GenerateQuizInput;
    quiz: Quiz;
    generatedAt: Date;
  }>;
}

export interface QuizGeneratorActions {
  // UI state management only - no AI calls
  setGenerating: (isGenerating: boolean) => void;
  setGenerationResult: (quiz: Quiz) => void;
  setGenerationError: (error: string | null) => void;
  resetGeneration: () => void;

  // Settings management
  updateDefaultSettings: (settings: Partial<GenerateQuizInput>) => void;

  // History management
  saveToHistory: (settings: GenerateQuizInput, quiz: Quiz) => void;
  clearHistory: () => void;
  getHistoryByTopic: (
    topic: string
  ) => Array<{ settings: GenerateQuizInput; quiz: Quiz; generatedAt: Date }>;
}

const initialState: QuizGeneratorState = {
  // Generation state
  isGenerating: false,
  generatedQuiz: null,
  generationError: null,

  // Generation settings
  defaultSettings: {
    topic: 'Fundamentals',
    technology: 'React',
    difficulty: 'Beginner',
    questionCount: 10,
    language: 'en',
  },
  lastGeneratedSettings: null,

  // Generation history
  generationHistory: [],
};

export const useQuizGeneratorStore = create<
  QuizGeneratorState & QuizGeneratorActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // UI state management only - no AI calls
      setGenerating: (isGenerating: boolean) => {
        set({ isGenerating });
      },

      setGenerationResult: (quiz: Quiz) => {
        set({
          isGenerating: false,
          generatedQuiz: quiz,
          generationError: null,
        });
      },

      setGenerationError: (error: string | null) => {
        set({
          isGenerating: false,
          generationError: error,
        });
      },

      resetGeneration: () => {
        set({
          isGenerating: false,
          generatedQuiz: null,
          generationError: null,
        });
      },

      // Settings management
      updateDefaultSettings: (settings: Partial<GenerateQuizInput>) => {
        const currentSettings = get().defaultSettings;
        set({
          defaultSettings: { ...currentSettings, ...settings },
        });
      },

      // History management
      saveToHistory: (settings: GenerateQuizInput, quiz: Quiz) => {
        const currentHistory = get().generationHistory;
        const newHistoryItem = {
          settings,
          quiz,
          generatedAt: new Date(),
        };

        set({
          generationHistory: [newHistoryItem, ...currentHistory].slice(0, 50), // Keep last 50
        });
      },

      clearHistory: () => {
        set({
          generationHistory: [],
        });
      },

      getHistoryByTopic: (topic: string) => {
        const history = get().generationHistory;
        return history.filter((item) =>
          item.settings.topic.toLowerCase().includes(topic.toLowerCase())
        );
      },
    }),
    {
      name: 'quiz-generator-store',
    }
  )
);
