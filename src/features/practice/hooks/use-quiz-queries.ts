import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Quiz, QuizAttempt } from '../type';
import {
  useQuizGeneratorStore,
  type GenerateQuizInput,
} from '../store/quiz-generator-store';
import { useQuizSessionStore } from '../store/quiz-session-store';
import { useProgressStore } from '../store/progress-store';
import { useQuizStore } from '../store/quiz-store';
import { QuizService } from '../services/quiz-service';

interface QuizFilters {
  difficulty?: string;
  topic?: string;
}

// Mock API functions (replace with real API calls)
const mockApi = {
  getQuizzes: async (_filters: QuizFilters = {}) => {
    // Mock implementation - replace with real API
    const mockQuizzes: Quiz[] = [];
    return mockQuizzes;
  },

  getQuizById: async (_id: number): Promise<Quiz | null> => {
    // Mock implementation - replace with real API
    return null;
  },

  generateQuiz: async (_input: GenerateQuizInput): Promise<Quiz> => {
    // This should use the AI service
    throw new Error('Use useQuizGeneratorStore.startGeneration instead');
  },

  saveQuizAttempt: async (attempt: QuizAttempt): Promise<QuizAttempt> => {
    // Mock implementation - replace with real API
    return attempt;
  },
};

// Query keys factory
export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (filters: QuizFilters) => [...quizKeys.lists(), filters] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: number) => [...quizKeys.details(), id] as const,
  stats: () => [...quizKeys.all, 'stats'] as const,
};

// Hook to fetch quizzes with filters
export const useQuizzes = (filters: QuizFilters = {}) => {
  return useQuery({
    queryKey: quizKeys.list(filters),
    queryFn: () => mockApi.getQuizzes(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch a single quiz by ID
export const useQuiz = (id: number) => {
  return useQuery({
    queryKey: quizKeys.detail(id),
    queryFn: () => mockApi.getQuizById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Enhanced React Query + Zustand hooks with proper error/success handling

// Hook to generate quiz with AI using React Query + Zustand
export const useGenerateQuizMutation = () => {
  const queryClient = useQueryClient();
  const quizService = QuizService.getInstance();
  const { resetGeneration } = useQuizGeneratorStore();
  
  return useMutation({
    mutationFn: async (input: GenerateQuizInput): Promise<Quiz> => {
      // Reset any previous generation state
      resetGeneration();
      
      // Use service to generate quiz
      return await quizService.generateQuiz(input);
    },
    onSuccess: (quiz: Quiz, _input: GenerateQuizInput) => {
      console.log('✅ Quiz generated successfully:', quiz.title);
      
      // Invalidate related queries
      void queryClient.invalidateQueries({
        queryKey: quizKeys.lists(),
      });
      
      // Optional: Store in React Query cache for later use
      queryClient.setQueryData(quizKeys.detail(quiz.id), quiz);
    },
    onError: (error: Error, _input: GenerateQuizInput) => {
      console.error('❌ Quiz generation failed:', error.message);
      
      // Error is already handled by Zustand store
      // You could add toast notifications here
    },
    onSettled: (quiz, error, input) => {
      // Always runs regardless of success/error
      console.log('🔄 Quiz generation completed for:', input.topic);
    },
  });
};

// Hook to generate and start quiz flow
export const useGenerateAndStartQuizMutation = () => {
  const navigate = useNavigate();
  const generateMutation = useGenerateQuizMutation();
  const { startQuiz } = useQuizSessionStore();
  const { startQuizFlow } = useQuizStore();
  
  return useMutation({
    mutationFn: async (input: GenerateQuizInput): Promise<Quiz> => {
      return await generateMutation.mutateAsync(input);
    },
    onSuccess: (quiz: Quiz) => {
      console.log('✅ Starting quiz flow for:', quiz.title);
      
      // Start quiz session
      startQuiz(quiz);
      startQuizFlow(quiz);
      
      // Navigate to quiz
      void navigate(`/practice/${quiz.id}`);
    },
    onError: (error: Error, _input: GenerateQuizInput) => {
      console.error('❌ Failed to generate and start quiz:', error.message);
      // Error handling - you could show a toast here
    },
  });
};

// Hook to save quiz attempts with React Query + Zustand
export const useSubmitQuizMutation = () => {
  const queryClient = useQueryClient();
  const quizService = QuizService.getInstance();
  const { saveQuizAttempt: saveToStore } = useProgressStore();

  return useMutation({
    mutationFn: async (attempt: QuizAttempt): Promise<QuizAttempt> => {
      // Save to API (via service)
      const savedAttempt = await quizService.saveQuizAttempt(attempt);
      
      // Also save to Zustand store for local state
      saveToStore(savedAttempt);
      
      return savedAttempt;
    },
    onSuccess: (savedAttempt: QuizAttempt) => {
      console.log('✅ Quiz attempt saved successfully:', savedAttempt.id);
      
      // Invalidate related queries
      void queryClient.invalidateQueries({
        queryKey: quizKeys.stats(),
      });
    },
    onError: (error: Error, attempt: QuizAttempt) => {
      console.error('❌ Failed to save quiz attempt:', error.message);
      
      // Still save to local store even if API fails
      saveToStore(attempt);
    },
    onSettled: (savedAttempt, error, attempt) => {
      console.log('🔄 Quiz attempt processing completed for quiz:', attempt.quizId);
    },
  });
};

// Hook for quiz error handling with toast notifications (optional)
export const useQuizNotifications = () => {
  return {
    showSuccess: (message: string) => {
      console.log('✅ Success:', message);
      // You can integrate with toast libraries like react-hot-toast here
    },
    showError: (message: string) => {
      console.error('❌ Error:', message);
      // You can integrate with toast libraries here
    },
    showInfo: (message: string) => {
      console.log('ℹ️ Info:', message);
      // You can integrate with toast libraries here
    },
  };
};

// Hook to start a quiz session (uses Zustand stores)
export const useStartQuizSession = () => {
  const { startQuiz } = useQuizSessionStore();
  const { startQuizFlow } = useQuizStore();

  return {
    startSession: (quiz: Quiz) => {
      startQuiz(quiz);
      startQuizFlow(quiz);
    },
  };
};

// Hook to end a quiz session (uses Zustand stores)
export const useEndQuizSession = () => {
  const sessionStore = useQuizSessionStore();
  const { saveQuizAttempt } = useProgressStore();
  const { completeQuizSession } = useQuizStore();

  return {
    endSession: () => {
      if (sessionStore.currentQuiz) {
        // Create quiz attempt from session data
        const attempt: QuizAttempt = {
          id: Date.now(), // Generate unique ID
          quizId: sessionStore.currentQuiz.id,
          score: sessionStore.currentScore,
          completedAt: new Date().toISOString(),
          timeSpent:
            sessionStore.startTime && sessionStore.endTime
              ? (sessionStore.endTime.getTime() -
                  sessionStore.startTime.getTime()) /
                1000
              : 0,
          answers: sessionStore.answers,
          totalQuestions: sessionStore.currentQuiz.questions.length,
          percentage: sessionStore.currentScore,
          topicId: sessionStore.currentQuiz.topicId,
          topicName: 'Practice', // You might want to get this from somewhere else
          difficulty: sessionStore.currentQuiz.difficulty,
        };

        // Save attempt to progress store
        saveQuizAttempt(attempt);
      }

      // End quiz flow
      completeQuizSession();
    },
  };
};

// Hook for quiz statistics (uses Zustand store)
export const useQuizStatistics = (quizId?: number) => {
  const { quizAttempts } = useProgressStore();

  const quizSpecificAttempts = quizId
    ? quizAttempts.filter((attempt: QuizAttempt) => attempt.quizId === quizId)
    : quizAttempts;

  return {
    totalAttempts: quizSpecificAttempts.length,
    averageScore:
      quizSpecificAttempts.length > 0
        ? Math.round(
            quizSpecificAttempts.reduce(
              (sum: number, attempt: QuizAttempt) => sum + attempt.percentage,
              0
            ) / quizSpecificAttempts.length
          )
        : 0,
    bestScore:
      quizSpecificAttempts.length > 0
        ? Math.max(
            ...quizSpecificAttempts.map(
              (attempt: QuizAttempt) => attempt.percentage
            )
          )
        : 0,
  };
};
