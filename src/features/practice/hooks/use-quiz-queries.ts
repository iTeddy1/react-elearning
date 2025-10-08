import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Quiz, QuizAttempt } from '../types';
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

// Query keys factory
export const quizKeys = {
  all: ['quizzes'] as const,
  lists: () => [...quizKeys.all, 'list'] as const,
  list: (filters: QuizFilters) => [...quizKeys.lists(), filters] as const,
  details: () => [...quizKeys.all, 'detail'] as const,
  detail: (id: number) => [...quizKeys.details(), id] as const,
  stats: () => [...quizKeys.all, 'stats'] as const,
};

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
    onSuccess: (quiz: Quiz) => {
      toast.success(`Quiz "${quiz.title}" generated successfully!`, {
        description: `${quiz.questions.length} questions ready for practice`,
      });

      // Invalidate related queries
      void queryClient.invalidateQueries({
        queryKey: quizKeys.lists(),
      });

      // Optional: Store in React Query cache for later use
      queryClient.setQueryData(quizKeys.detail(quiz.id), quiz);
    },
    onError: (error: Error) => {
      console.error('❌ Quiz generation failed:', error.message);

      toast.error('Failed to generate quiz', {
        description: error.message.includes('parse')
          ? 'The AI returned invalid data. Please try again.'
          : error.message,
      });

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
      toast.success('Quiz started!', {
        description: `Good luck with "${quiz.title}"`,
      });

      // Start quiz session
      startQuiz(quiz);
      startQuizFlow(quiz);

      // Navigate to quiz
      void navigate(`/practice/${quiz.id}`);
    },
    onError: (error: Error) => {
      console.error('❌ Failed to generate and start quiz:', error.message);

      toast.error('Failed to start quiz', {
        description: error.message.includes('parse')
          ? 'The AI returned invalid data. Please try again.'
          : error.message,
      });
    },
  });
};

// Hook to save quiz attempts locally with React Query + Zustand
export const useSubmitQuizMutation = () => {
  const queryClient = useQueryClient();
  const quizService = QuizService.getInstance();

  return useMutation({
    mutationFn: async (attempt: QuizAttempt): Promise<QuizAttempt> => {
      // Save locally only (no API call)
      return Promise.resolve(quizService.saveQuizAttempt(attempt));
    },
    onSuccess: (savedAttempt: QuizAttempt) => {
      console.log('✅ Quiz attempt saved successfully:', savedAttempt.id);

      toast.success('Quiz completed!', {
        description: `Score: ${savedAttempt.percentage}% (${savedAttempt.score}/${savedAttempt.totalQuestions})`,
      });

      // Invalidate related queries
      void queryClient.invalidateQueries({
        queryKey: quizKeys.stats(),
      });
    },
    onError: (error: Error) => {
      console.error('❌ Failed to save quiz attempt:', error.message);

      toast.error('Failed to save quiz', {
        description: 'Please try submitting again.',
      });
    },
    onSettled: (savedAttempt, error, attempt) => {
      console.log(
        '🔄 Quiz attempt processing completed for quiz:',
        attempt.quizId
      );
    },
  });
};

// Hook for quiz notifications using sonner toast
export const useQuizNotifications = () => {
  return {
    showSuccess: (message: string, description?: string) => {
      toast.success(message, { description });
    },
    showError: (message: string, description?: string) => {
      toast.error(message, { description });
    },
    showInfo: (message: string, description?: string) => {
      toast.info(message, { description });
    },
    showWarning: (message: string, description?: string) => {
      toast.warning(message, { description });
    },
    showLoading: (message: string, description?: string) => {
      return toast.loading(message, { description });
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
          id: Date.now().toString(), // Generate unique ID as string
          quizId: sessionStore.currentQuiz.id,
          score: sessionStore.currentScore,
          completedAt: new Date(),
          startedAt: sessionStore.startTime || new Date(),
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
          difficulty: sessionStore.currentQuiz.difficulty.toLowerCase() as
            | 'beginner'
            | 'intermediate'
            | 'advanced',
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
