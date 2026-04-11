import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Quiz } from '../types';
import type {
  GenerateQuizInput,
  GenerateReviewRequest,
} from '../services/quiz-service';
import { usePracticeAI } from '@/providers/AIServiceProvider';
import { useQuizSessionStore } from '../store/quiz-session-store';
import { useQuizGeneratorStore } from '../store/quiz-generator-store';

export const practiceQueryKeys = {
  all: ['practice'] as const,
  quizzes: () => [...practiceQueryKeys.all, 'quizzes'] as const,
  quiz: (id: string | number) => [...practiceQueryKeys.quizzes(), id] as const,
  generated: () => [...practiceQueryKeys.all, 'generated'] as const,
  reviews: () => [...practiceQueryKeys.all, 'reviews'] as const,
  review: (quizId: number) => [...practiceQueryKeys.reviews(), quizId] as const,
} as const;

/**
 * Get cached generated quiz
 * Persists in React Query cache with 30min stale time
 */
export const useGeneratedQuiz = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: practiceQueryKeys.generated(),
    queryFn: () => {
      // Return cached data or null
      const cached = queryClient.getQueryData<Quiz>(
        practiceQueryKeys.generated()
      );
      return cached || null;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    enabled: false, // Only manual fetch
  });
};

// ================================
// MUTATION HOOKS - Server Operations
// ================================

/**
 * Generate quiz using AI service
 * Flow: UI → React Query → QuizService → AI Service
 * Caches result for reuse
 */
export const useGenerateQuizMutation = (callbacks?: {
  onStart?: () => void;
  onSuccess?: (quiz: Quiz) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}) => {
  const queryClient = useQueryClient();
  const practiceAI = usePracticeAI();

  return useMutation({
    mutationFn: async (request: GenerateQuizInput): Promise<Quiz> => {
      const questions = await practiceAI.generateQuiz({
        topic: request.topic,
        technology: request.technology,
        difficulty: request.difficulty,
        numQuestions: request.questionCount,
        language: request.language === 'vi' ? 'Vietnamese' : 'English',
        focusArea: request.focusArea,
      });

      // Transform to Quiz format
      const quiz: Quiz = {
        id: Date.now(),
        title: `${request.technology} ${request.topic} - ${request.difficulty} Quiz`,
        topic: request.topic,
        topicId: Date.now(),
        technology: request.technology,
        difficulty: request.difficulty.toLowerCase() as
          | 'beginner'
          | 'intermediate'
          | 'advanced',
        questions,
        timeLimit: request.questionCount * 120, // 2 minutes per question
        createdAt: new Date(),
      };

      return quiz;
    },

    onMutate: () => {
      callbacks?.onStart?.();
    },

    onSuccess: (quiz: Quiz) => {
      // Cache the generated quiz with persistence
      queryClient.setQueryData(practiceQueryKeys.generated(), quiz);

      // Also cache by ID for future retrieval
      queryClient.setQueryData(practiceQueryKeys.quiz(quiz.id), quiz);

      // Show success toast
      toast.success(`Quiz "${quiz.title}" generated successfully!`, {
        description: `${quiz.questions.length} questions ready for practice`,
        duration: 3000,
      });

      console.log('✅ Quiz cached:', quiz.id);

      // Callback for UI updates
      callbacks?.onSuccess?.(quiz);
    },

    onError: (error: Error) => {
      console.error('❌ Quiz generation failed:', error.message);

      // Show error toast
      toast.error('Failed to generate quiz', {
        description: error.message.includes('parse')
          ? 'The AI returned invalid data. Please try again.'
          : error.message,
        duration: 5000,
      });

      // Callback for UI updates
      callbacks?.onError?.(error);
    },

    onSettled: () => {
      callbacks?.onSettled?.();
    },
  });
};

/**
 * Generate quiz review using AI service
 * Flow: UI → React Query → QuizService → AI Service
 * Caches review by quiz ID
 */
export const useGenerateReviewMutation = (callbacks?: {
  onStart?: () => void;
  onSuccess?: (review: string, quizId?: number) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}) => {
  const queryClient = useQueryClient();
  const practiceAI = usePracticeAI();

  return useMutation({
    mutationFn: async (
      request: GenerateReviewRequest & { quizId?: number }
    ): Promise<{
      review: string;
      quizId?: number;
    }> => {
      // Check cache if quizId provided
      if (request.quizId) {
        const cached = queryClient.getQueryData<string>(
          practiceQueryKeys.review(request.quizId)
        );
        if (cached) {
          console.log('📦 Using cached review');
          return { review: cached, quizId: request.quizId };
        }
      }

      // Generate new review via AI
      const review = await practiceAI.generateReview(
        request.payloadJSON,
        request.answers,
        request.technology,
        request.language || 'en'
      );

      return { review, quizId: request.quizId };
    },

    onMutate: () => {
      callbacks?.onStart?.();
    },

    onSuccess: ({ review, quizId }) => {
      // Cache the review if quizId provided
      if (quizId) {
        queryClient.setQueryData(practiceQueryKeys.review(quizId), review);
        console.log('✅ Review cached for quiz:', quizId);
      }

      // Show success toast
      toast.success('Quiz review generated successfully!', {
        description: 'Your performance analysis is ready',
        duration: 3000,
      });

      // Callback for UI updates
      callbacks?.onSuccess?.(review, quizId);
    },

    onError: (error: Error) => {
      console.error('❌ Review generation failed:', error.message);

      // Show error toast
      toast.error('Failed to generate review', {
        description: error.message.includes('parse')
          ? 'The AI returned invalid data. Please try again.'
          : error.message,
        duration: 5000,
      });

      // Callback for UI updates
      callbacks?.onError?.(error);
    },

    onSettled: () => {
      callbacks?.onSettled?.();
    },
  });
};

// ================================
// CACHE UTILITIES
// ================================

/**
 * Utility hook for manual cache management
 */
export const usePracticeCacheUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Get cached generated quiz
    getCachedQuiz: (): Quiz | undefined => {
      return queryClient.getQueryData(practiceQueryKeys.generated());
    },

    // Get cached quiz by ID
    getQuizById: (id: number): Quiz | undefined => {
      return queryClient.getQueryData(practiceQueryKeys.quiz(id));
    },

    // Get cached review
    getCachedReview: (quizId: number): string | undefined => {
      return queryClient.getQueryData(practiceQueryKeys.review(quizId));
    },

    // Set quiz in cache
    setCachedQuiz: (quiz: Quiz) => {
      queryClient.setQueryData(practiceQueryKeys.generated(), quiz);
      queryClient.setQueryData(practiceQueryKeys.quiz(quiz.id), quiz);
    },

    // Clear generated quiz cache
    clearGeneratedQuiz: () => {
      queryClient.removeQueries({ queryKey: practiceQueryKeys.generated() });
    },

    // Clear specific quiz cache
    clearQuizById: (id: number) => {
      queryClient.removeQueries({ queryKey: practiceQueryKeys.quiz(id) });
    },

    // Clear review cache
    clearReview: (quizId: number) => {
      queryClient.removeQueries({ queryKey: practiceQueryKeys.review(quizId) });
    },

    // Clear all practice cache
    clearAllCache: () => {
      void queryClient.invalidateQueries({ queryKey: practiceQueryKeys.all });
    },

    // Prefetch quiz (for performance)
    prefetchQuiz: async (quiz: Quiz) => {
      await queryClient.prefetchQuery({
        queryKey: practiceQueryKeys.quiz(quiz.id),
        queryFn: () => quiz,
        staleTime: 30 * 60 * 1000,
      });
    },
  };
};

// ================================
// COMBINED HOOKS FOR COMMON WORKFLOWS
// ================================

/**
 * Generate quiz and automatically start session
 * Combines generation + session start for convenience
 */
export const useGenerateAndStartQuizMutation = () => {
  const navigate = useNavigate();
  const { startQuiz, resetQuiz } = useQuizSessionStore();
  const { setGenerationResult, setGenerationError } = useQuizGeneratorStore();

  const generateMutation = useGenerateQuizMutation({
    onStart: () => {
      resetQuiz();
      setGenerationError(null);
    },
    onSuccess: (quiz) => {
      setGenerationResult(quiz);

      // Start quiz session
      startQuiz(quiz);

      // Navigate to quiz taking page
      void navigate('/practice/quiz-taking');
    },
    onError: (error) => {
      setGenerationError(error.message);
    },
  });

  return generateMutation;
};

/**
 * Notification utilities for quiz operations
 */
export const useQuizNotifications = () => {
  return {
    showSuccess: (message: string, description?: string) => {
      toast.success(message, {
        description,
        duration: 3000,
      });
    },
    showError: (message: string, description?: string) => {
      toast.error(message, {
        description,
        duration: 5000,
      });
    },
    showLoading: (message: string, id: string) => {
      toast.loading(message, { id });
    },
    dismissLoading: (id: string) => {
      toast.dismiss(id);
    },
  };
};

// ================================
// HELPER HOOKS
// ================================

/**
 * Prepare review payload from quiz and answers
 */
export const usePrepareReviewPayload = () => {
  return (
    quiz: Quiz,
    userAnswers: Record<number, number>
  ): {
    payloadJSON: string;
    answers: (0 | 1 | 2 | 3 | null)[];
    quizId: number;
  } => {
    // Create quiz payload for AI
    const quizPayload = {
      meta: {
        topic: quiz.title,
        difficulty: quiz.difficulty,
        language: 'en',
        numQuestions: quiz.questions.length,
        technology: quiz.technology,
      },
      items: quiz.questions.map((q) => ({
        id: q.id.toString(),
        question: q.question,
        choices: q.options,
        answerIndex: q.correctAnswer,
        explanation: q.explanation,
        tags: q.tags || [quiz.technology.toLowerCase()],
      })),
    };

    // Convert user answers to AI format
    const answers: (0 | 1 | 2 | 3 | null)[] = quiz.questions.map((question) => {
      const userAnswer = userAnswers[question.id];
      return userAnswer !== undefined ? (userAnswer as 0 | 1 | 2 | 3) : null;
    });

    return {
      payloadJSON: JSON.stringify(quizPayload),
      answers,
      quizId: quiz.id,
    };
  };
};
