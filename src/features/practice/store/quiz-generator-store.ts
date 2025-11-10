import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  PracticeAIService,
  QuizGenerationOptions,
} from '../services/ai/practice-ai-service';
import { Quiz, QuizQuestion } from '../types';
import { practiceConfig } from '../config';

export interface GenerateQuizInput {
  topic: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  language?: 'en' | 'vi';
}

// Helper function to convert AI questions to Quiz format
const convertQuestionsToQuiz = (
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
  // Generation actions
  startGeneration: (settings: GenerateQuizInput) => Promise<void>;
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

// Create AI service instance
const practiceAIService = new PracticeAIService({
  apiKey: practiceConfig.GOOGLE_GENAI_API_KEY,
  model: practiceConfig.AI_MODEL,
});

export const useQuizGeneratorStore = create<
  QuizGeneratorState & QuizGeneratorActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Generation actions
      startGeneration: async (settings: GenerateQuizInput) => {
        set({
          isGenerating: true,
          generationError: null,
          lastGeneratedSettings: settings,
        });

        try {
          // Convert to AI service options
          const aiOptions: QuizGenerationOptions = {
            technology: settings.technology,
            topic: `${settings.technology} ${settings.topic}`,
            difficulty: settings.difficulty,
            numQuestions: settings.questionCount,
            language: settings.language === 'vi' ? 'Vietnamese' : 'English',
          };
          console.log('Starting quiz generation with options:', aiOptions);
          // Call AI service
          const questions = await practiceAIService.generateQuiz(aiOptions);

          if (!questions || questions.length === 0) {
            throw new Error('No questions generated');
          }

          // Convert questions to Quiz format
          const quiz = convertQuestionsToQuiz(questions, settings);

          // Update store with results
          get().setGenerationResult(quiz);
          get().saveToHistory(settings, quiz);
        } catch (error) {
          console.error('Quiz generation failed:', error);
          set({
            isGenerating: false,
            generationError:
              error instanceof Error ? error.message : 'Quiz generation failed',
          });
        }
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
