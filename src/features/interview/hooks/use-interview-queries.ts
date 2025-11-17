import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type {
  InterviewQuestion,
  InterviewReview,
  GenerateQuestionsRequest,
} from '../types';
import { useInterviewAI } from '@/providers/AIServiceProvider';
import { useInterviewSessionStore } from '../store/interview-session-store';
import { useInterviewProgressStore } from '../store/interview-progress-store';

export const interviewQueryKeys = {
  all: ['interview'] as const,
  sessions: () => [...interviewQueryKeys.all, 'sessions'] as const,
  session: (id: string) => [...interviewQueryKeys.sessions(), id] as const,
  generated: () => [...interviewQueryKeys.all, 'generated'] as const,
  reviews: () => [...interviewQueryKeys.all, 'reviews'] as const,
  review: (sessionId: string) =>
    [...interviewQueryKeys.reviews(), sessionId] as const,
  progress: () => [...interviewQueryKeys.all, 'progress'] as const,
} as const;

// ================================
// QUERY HOOKS - With Caching
// ================================

/**
 * Get cached generated InterviewQuestions
 * Persists in React Query cache with 30min stale time
 */
export const useGeneratedInterviewQuestions = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: interviewQueryKeys.generated(),
    queryFn: () => {
      // Return cached data or null
      const cached = queryClient.getQueryData<InterviewQuestion>(
        interviewQueryKeys.generated()
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
 * Generate interview questions using AI service
 * Flow: UI → React Query → AI Service
 * Caches result for reuse
 */
export const useGenerateInterviewQuestionsMutation = (callbacks?: {
  onStart?: () => void;
  onSuccess?: (
    questions: InterviewQuestion[],
    config: GenerateQuestionsRequest
  ) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}) => {
  const queryClient = useQueryClient();
  const interviewAI = useInterviewAI();

  return useMutation({
    mutationFn: async (
      request: GenerateQuestionsRequest
    ): Promise<InterviewQuestion[]> => {
      // Check cache first
      const cached = queryClient.getQueryData<InterviewQuestion[]>(
        interviewQueryKeys.generated()
      );

      if (cached && cached.length > 0) {
        console.log('📦 Using cached interview questions');
        return cached;
      }

      // Generate new questions via AI
      console.log('🤖 Generating new interview questions via AI');
      const aiQuestions = await interviewAI.generateInterviewQuestions({
        role: request.jobRole,
        experience: request.difficulty,
        roundType: request.roundType,
        skills: [],
        numberOfQuestions: request.questionCount,
        difficulty: (request.difficulty.charAt(0).toUpperCase() +
          request.difficulty.slice(1)) as
          | 'Beginner'
          | 'Intermediate'
          | 'Advanced',
        language: request.language,
      });

      // Transform to InterviewQuestion format
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

      return questions;
    },

    onMutate: () => {
      callbacks?.onStart?.();
    },

    onSuccess: (
      questions: InterviewQuestion[],
      config: GenerateQuestionsRequest
    ) => {
      // Cache the generated questions with persistence
      queryClient.setQueryData(interviewQueryKeys.generated(), questions);

      // Show success toast
      toast.success('Interview questions generated!', {
        description: `${questions.length} questions ready for ${config.jobRole} interview`,
        duration: 3000,
      });

      console.log('✅ Interview questions cached:', questions.length);

      // Callback for UI updates
      callbacks?.onSuccess?.(questions, config);
    },

    onError: (error: Error) => {
      console.error('❌ InterviewQuestions generation failed:', error.message);

      // Show error toast
      toast.error('Failed to generate InterviewQuestions', {
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
 * Generate interview questions and automatically start session
 * Combines generation + session start for convenience
 */
export const useGenerateAndStartInterviewMutation = () => {
  const navigate = useNavigate();
  const { startSession } = useInterviewSessionStore();

  return useGenerateInterviewQuestionsMutation({
    onSuccess: (questions, config) => {
      // Start session in store
      startSession({
        jobRole: config.jobRole,
        difficulty: config.difficulty,
        questions,
      });

      // Navigate to session page
      void navigate('/interview/session');
    },
  });
};

/**
 * Generate interview review using AI service
 * Flow: UI → React Query → AI Service
 * Caches review by session ID
 */
export const useGenerateInterviewReviewMutation = (callbacks?: {
  onStart?: () => void;
  onSuccess?: (review: InterviewReview, sessionId?: string) => void;
  onError?: (error: Error) => void;
  onSettled?: () => void;
}) => {
  const queryClient = useQueryClient();
  const interviewAI = useInterviewAI();
  const { saveAttempt } = useInterviewProgressStore();

  return useMutation({
    mutationFn: async (request: {
      questions: InterviewQuestion[];
      answers: Array<{
        questionId: string;
        questionIndex: number;
        question: string;
        expectedTopics: string[];
        audioBlob: Blob;
        duration?: number;
        recordedAt: string;
      }>;
      role: string;
      language?: 'en' | 'vi';
      sessionId?: string;
    }): Promise<{
      review: InterviewReview;
      sessionId?: string;
    }> => {
      // Check cache if sessionId provided
      if (request.sessionId) {
        const cached = queryClient.getQueryData<InterviewReview>(
          interviewQueryKeys.review(request.sessionId)
        );
        if (cached) {
          console.log('📦 Using cached review');
          return { review: cached, sessionId: request.sessionId };
        }
      }

      // Generate new review via AI
      console.log('📋 Generating new interview review via AI');
      const feedback = await interviewAI.reviewInterview({
        questions: request.questions.map((q) => ({
          id: q.id,
          category: q.category,
          question: q.question,
          difficulty: (q.difficulty.charAt(0).toUpperCase() +
            q.difficulty.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced',
          expectedTopics: q.expectedTopics,
          followUpQuestions: q.followUpQuestions,
        })),
        answers: request.answers,
        role: request.role,
        language: request.language,
      });

      // Transform AI feedback to InterviewReview format - PRESERVE ALL FIELDS
      const review: InterviewReview = {
        sessionId: request.sessionId || Date.now().toString(),
        overallScore: feedback.overallScore,
        scores: feedback.scores,
        communicationMetrics: feedback.communicationMetrics,
        strengths: feedback.overallFeedback.strengths,
        weaknesses: feedback.overallFeedback.weaknesses,
        recommendations: feedback.overallFeedback.recommendations,
        detailedFeedback: feedback.overallFeedback.summary,
        questionFeedback: feedback.questionAnalysis.map((qa) => ({
          questionId: request.questions[qa.questionIndex]?.id || '',
          score: qa.score,
          feedback: qa.feedback,
          transcription: qa.transcription,
          detailedScores: qa.detailedScores,
          strengths: qa.strengths,
          weaknesses: qa.weaknesses,
          criticalPoints: qa.criticalPoints,
          improvementAreas: qa.improvementAreas,
        })),
        suggestedImprovements: feedback.overallFeedback.recommendations,
        nextSteps: feedback.overallFeedback.recommendations,
        hiringPotential: feedback.overallFeedback.hiringPotential,
        redFlags: feedback.overallFeedback.redFlags,
        standoutMoments: feedback.overallFeedback.standoutMoments,
        criticalConcerns: feedback.overallFeedback.criticalConcerns,
      };

      // Save attempt to progress store
      saveAttempt({
        id: review.sessionId,
        jobRole: request.role,
        difficulty: 'intermediate',
        questionsCount: request.questions.length,
        completedAt: new Date(),
        duration: 0,
        overallScore: review.overallScore,
        feedback: {
          overallScore: review.overallScore,
          strengths: review.strengths,
          weaknesses: review.weaknesses,
          improvements: review.suggestedImprovements,
          recommendations: review.recommendations,
        },
      });

      return { review, sessionId: request.sessionId };
    },

    onMutate: () => {
      callbacks?.onStart?.();
    },

    onSuccess: ({ review, sessionId }) => {
      // Cache the review if sessionId provided
      if (sessionId) {
        queryClient.setQueryData(interviewQueryKeys.review(sessionId), review);
        console.log('✅ Review cached for session:', sessionId);
      }

      // Show success toast
      toast.success('Interview review generated successfully!', {
        description: `Overall score: ${review.overallScore}%`,
        duration: 3000,
      });

      // Callback for UI updates
      callbacks?.onSuccess?.(review, sessionId);
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
export const useInterviewCacheUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Get cached generated questions
    getCachedQuestions: (): InterviewQuestion[] | undefined => {
      return queryClient.getQueryData(interviewQueryKeys.generated());
    },

    // Get cached review
    getCachedReview: (sessionId: string): InterviewReview | undefined => {
      return queryClient.getQueryData(interviewQueryKeys.review(sessionId));
    },

    // Set questions in cache
    setCachedQuestions: (questions: InterviewQuestion[]) => {
      queryClient.setQueryData(interviewQueryKeys.generated(), questions);
    },

    // Clear generated questions cache
    clearGeneratedQuestions: () => {
      queryClient.removeQueries({ queryKey: interviewQueryKeys.generated() });
    },

    // Clear review cache
    clearReview: (sessionId: string) => {
      queryClient.removeQueries({
        queryKey: interviewQueryKeys.review(sessionId),
      });
    },

    // Clear all interview cache
    clearAllCache: () => {
      void queryClient.invalidateQueries({ queryKey: interviewQueryKeys.all });
    },
  };
};

// ================================
// QUERY HOOKS
// ================================

/**
 * React Query hook for getting interview session data
 */
export const useInterviewSession = () => {
  const { currentSession } = useInterviewSessionStore();

  return useQuery({
    queryKey: ['interview-session', currentSession?.id],
    queryFn: () => currentSession,
    enabled: !!currentSession,
    staleTime: Infinity, // Session data doesn't change from external sources
  });
};

/**
 * React Query hook for getting interview progress data
 */
export const useInterviewProgress = () => {
  const { attempts, totalInterviews, averageScore, bestScore } =
    useInterviewProgressStore();

  return useQuery({
    queryKey: interviewQueryKeys.progress(),
    queryFn: () => ({
      attempts,
      stats: {
        totalInterviews,
        averageScore,
        bestScore,
      },
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Mutation for clearing all interview data
 */
export const useClearInterviewDataMutation = () => {
  const { resetSession } = useInterviewSessionStore();
  const { clearHistory } = useInterviewProgressStore();
  const cacheUtils = useInterviewCacheUtils();

  return useMutation({
    mutationFn: () => {
      // Clear data from stores
      resetSession();
      clearHistory();

      // Clear cache
      cacheUtils.clearAllCache();

      return Promise.resolve();
    },
    onSuccess: () => {
      console.log('✅ Interview data cleared');
      toast.success('Interview data cleared', {
        description: 'All local interview data has been removed',
      });
    },
    onError: (error: Error) => {
      console.error('❌ Failed to clear interview data:', error);
      toast.error('Failed to clear data', {
        description: error.message || 'Please try again',
      });
    },
  });
};
