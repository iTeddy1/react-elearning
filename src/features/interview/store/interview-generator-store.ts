import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { InterviewQuestion, GenerateQuestionsRequest } from '../types';
import { InterviewAIService } from '../services/ai/interview-ai-service';

// Interview Generator Types
export interface InterviewGeneratorState {
  // Generation state
  isGenerating: boolean;
  generationError: string | null;
  generatedQuestions: InterviewQuestion[];

  // Generation metadata
  lastGenerationConfig: GenerateQuestionsRequest | null;
  generatedAt: Date | null;

  // AI service status
  aiServiceReady: boolean;
}

export interface InterviewGeneratorActions {
  // Question generation
  generateQuestions: (
    config: GenerateQuestionsRequest
  ) => Promise<InterviewQuestion[]>;
  resetGeneration: () => void;
  clearError: () => void;

  // Service management
  initializeAIService: () => void;
}

const initialState: InterviewGeneratorState = {
  isGenerating: false,
  generationError: null,
  generatedQuestions: [],
  lastGenerationConfig: null,
  generatedAt: null,
  aiServiceReady: false,
};

// Create AI service instance
let aiServiceInstance: InterviewAIService | null = null;

const getAIService = (): InterviewAIService => {
  if (!aiServiceInstance) {
    // Get API key from practice config since interview config doesn't have it
    const practiceConfig = {
      GOOGLE_GENAI_API_KEY: import.meta.env.VITE_GOOGLE_GENAI_API_KEY || '',
      AI_MODEL: 'gemini-pro',
    };

    aiServiceInstance = new InterviewAIService({
      apiKey: practiceConfig.GOOGLE_GENAI_API_KEY,
      model: practiceConfig.AI_MODEL,
    });
  }
  return aiServiceInstance;
};

export const useInterviewGeneratorStore = create<
  InterviewGeneratorState & InterviewGeneratorActions
>()(
  devtools(
    (set) => ({
      ...initialState,

      generateQuestions: async (
        config: GenerateQuestionsRequest
      ): Promise<InterviewQuestion[]> => {
        set({
          isGenerating: true,
          generationError: null,
          lastGenerationConfig: config,
        });

        try {
          const aiService = getAIService();

          const options = {
            role: config.jobRole,
            experience: config.difficulty,
            skills: [],
            roundType: config.roundType,
            numberOfQuestions: config.questionCount,
            difficulty: (config.difficulty.charAt(0).toUpperCase() +
              config.difficulty.slice(1)) as
              | 'Beginner'
              | 'Intermediate'
              | 'Advanced',
            language: 'en' as const,
          };

          const aiQuestions =
            await aiService.generateInterviewQuestions(options);

          // Map AI service questions to interview questions
          const questions: InterviewQuestion[] = aiQuestions.map((q) => ({
            id: q.id,
            text: q.question,
            question: q.question,
            category: q.category,
            difficulty: q.difficulty.toLowerCase() as
              | 'beginner'
              | 'intermediate'
              | 'advanced',
            expectedTopics: q.expectedTopics,
            followUpQuestions: q.followUpQuestions,
          }));

          set({
            isGenerating: false,
            generatedQuestions: questions,
            generatedAt: new Date(),
            generationError: null,
          });

          console.log(
            '✅ Interview questions generated successfully:',
            questions.length
          );
          return questions;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Failed to generate interview questions';

          set({
            isGenerating: false,
            generationError: errorMessage,
          });

          console.error('❌ Interview question generation failed:', error);
          throw new Error(errorMessage);
        }
      },

      resetGeneration: () => {
        set({
          isGenerating: false,
          generationError: null,
          generatedQuestions: [],
          lastGenerationConfig: null,
          generatedAt: null,
        });
        console.log('🔄 Interview generation state reset');
      },

      clearError: () => {
        set({ generationError: null });
      },

      initializeAIService: () => {
        try {
          getAIService();
          set({ aiServiceReady: true });
          console.log('✅ Interview AI service initialized');
        } catch (error) {
          console.error('❌ Failed to initialize Interview AI service:', error);
          set({ aiServiceReady: false });
        }
      },
    }),
    {
      name: 'interview-generator-store',
    }
  )
);
