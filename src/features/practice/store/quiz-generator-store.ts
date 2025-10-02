import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Quiz, AIGeneratedQuizResponse } from '../type';
import { AIProvider } from '../services/ai';

export interface GenerateQuizInput {
  topic: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  language?: 'en' | 'vi';
}

// Helper function to convert AI response to Quiz format
const convertAIResponseToQuiz = (aiResponse: AIGeneratedQuizResponse, input: GenerateQuizInput): Quiz => {
  const capitalizeFirst = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
  
  return {
    id: Date.now(), // Generate unique ID
    title: `${capitalizeFirst(aiResponse.meta.topic)} - ${capitalizeFirst(aiResponse.meta.difficulty)} Quiz`,
    description: aiResponse.overall.summary,
    difficulty: capitalizeFirst(aiResponse.meta.difficulty) as 'Beginner' | 'Intermediate' | 'Advanced',
    timeLimit: input.questionCount * 2, // 2 minutes per question
    questions: aiResponse.items.map((item, index) => ({
      id: index + 1,
      question: item.question,
      options: item.choices,
      correctAnswer: item.answerIndex,
      explanation: item.explanation,
      difficulty: capitalizeFirst(aiResponse.meta.difficulty) as 'Beginner' | 'Intermediate' | 'Advanced',
      tags: item.tags,
    })),
    aiGenerated: true,
    aiMeta: aiResponse.meta,
    aiOverall: aiResponse.overall,
  };
};

export interface QuizGeneratorState {
  // Generation state
  isGenerating: boolean;
  generatedQuiz: Quiz | null;
  generationError: string | null;
  
  // Raw AI response for debugging
  lastAIResponse: AIGeneratedQuizResponse | null;
  
  // Generation settings
  defaultSettings: GenerateQuizInput;
  lastGeneratedSettings: GenerateQuizInput | null;
  
  // Generation history
  generationHistory: Array<{
    settings: GenerateQuizInput;
    quiz: Quiz;
    generatedAt: Date;
    aiResponse: AIGeneratedQuizResponse;
  }>;
}

export interface QuizGeneratorActions {
  // Generation actions
  startGeneration: (settings: GenerateQuizInput) => Promise<void>;
  setGenerationResult: (aiResponse: AIGeneratedQuizResponse, settings: GenerateQuizInput) => void;
  setGenerationError: (error: string | null) => void;
  resetGeneration: () => void;
  
  // Settings management
  updateDefaultSettings: (settings: Partial<GenerateQuizInput>) => void;
  
  // History management
  saveToHistory: (settings: GenerateQuizInput, quiz: Quiz, aiResponse: AIGeneratedQuizResponse) => void;
  clearHistory: () => void;
  getHistoryByTopic: (topic: string) => Array<{ settings: GenerateQuizInput; quiz: Quiz; generatedAt: Date }>;
}

const initialState: QuizGeneratorState = {
  // Generation state
  isGenerating: false,
  generatedQuiz: null,
  generationError: null,
  
  // Raw AI response for debugging
  lastAIResponse: null,
  
  // Generation settings
  defaultSettings: {
    topic: 'React',
    difficulty: 'Beginner',
    questionCount: 10,
    language: 'en',
  },
  lastGeneratedSettings: null,
  
  // Generation history
  generationHistory: [],
};

export const useQuizGeneratorStore = create<QuizGeneratorState & QuizGeneratorActions>()(
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
          // Convert difficulty to lowercase for AI service
          const aiInput = {
            topic: settings.topic,
            difficulty: settings.difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
            numQuestions: settings.questionCount,
            language: settings.language || 'en' as 'en' | 'vi',
          };

          // Call AI service
          const aiResponseText = await AIProvider.generateQuiz(aiInput);
          
          if (!aiResponseText) {
            throw new Error('Empty response from AI service');
          }
          
          const aiResponse = JSON.parse(aiResponseText) as AIGeneratedQuizResponse;
          
          // Convert AI response to Quiz format
          const quiz = convertAIResponseToQuiz(aiResponse, settings);
          
          // Update store with results
          get().setGenerationResult(aiResponse, settings);
          get().saveToHistory(settings, quiz, aiResponse);

        } catch (error) {
          console.error('Quiz generation failed:', error);
          set({
            isGenerating: false,
            generationError: error instanceof Error ? error.message : 'Quiz generation failed',
          });
        }
      },

      setGenerationResult: (aiResponse: AIGeneratedQuizResponse, settings: GenerateQuizInput) => {
        const quiz = convertAIResponseToQuiz(aiResponse, settings);
        
        set({
          isGenerating: false,
          generatedQuiz: quiz,
          lastAIResponse: aiResponse,
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
          lastAIResponse: null,
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
      saveToHistory: (settings: GenerateQuizInput, quiz: Quiz, aiResponse: AIGeneratedQuizResponse) => {
        const currentHistory = get().generationHistory;
        const newHistoryItem = {
          settings,
          quiz,
          aiResponse,
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
        return history
          .filter(item => item.settings.topic.toLowerCase().includes(topic.toLowerCase()))
          .map(({ settings, quiz, generatedAt }) => ({ settings, quiz, generatedAt }));
      },
    }),
    {
      name: 'quiz-generator-store',
    }
  )
);
