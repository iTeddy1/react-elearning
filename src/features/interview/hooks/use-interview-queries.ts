import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { interviewService } from '../services/interview-service';
import {
  GenerateQuestionsRequest,
  InterviewQuestion,
  InterviewReview,
} from '../types';
import { useInterviewSessionStore } from '../store/interview-session-store';
import { useInterviewProgressStore } from '../store/interview-progress-store';

/**
 * React Query hook for generating interview questions with local AI
 */
export const useGenerateInterviewQuestionsMutation = () => {
  const navigate = useNavigate();
  const { startSession } = useInterviewSessionStore();

  return useMutation({
    mutationFn: async (
      config: GenerateQuestionsRequest
    ): Promise<InterviewQuestion[]> => {
      // Generate questions using the service
      const questions = await interviewService.generateQuestions(config);

      // Start session in store
      startSession({
        jobRole: config.jobRole,
        difficulty: config.difficulty,
        questions,
      });

      // Navigate to session page (use void to ignore promise)
      void navigate('/interview/session');

      return questions;
    },
    onMutate: () => {
      console.log('🚀 Starting interview question generation...');
      toast.loading('Generating interview questions...', {
        id: 'generate-interview',
        description: 'AI is creating personalized questions for your interview',
      });
    },
    onSuccess: (questions, config) => {
      console.log(
        '✅ Interview questions generated successfully:',
        questions.length
      );
      toast.success('Interview questions generated!', {
        id: 'generate-interview',
        description: `${questions.length} questions ready for ${config.jobRole} interview`,
        action: {
          label: 'Start Interview',
          onClick: () => void navigate('/interview/session'),
        },
      });
    },
    onError: (error: Error) => {
      console.error('❌ Interview question generation failed:', error);
      toast.error('Failed to generate questions', {
        id: 'generate-interview',
        description: error.message || 'Please try again',
        action: {
          label: 'Retry',
          onClick: () => window.location.reload(),
        },
      });
    },
  });
};

/**
 * React Query hook for generating interview review
 */
export const useGenerateInterviewReviewMutation = () => {
  const { saveAttempt } = useInterviewProgressStore();

  return useMutation({
    mutationFn: async ({
      questions,
      answers,
    }: {
      questions: InterviewQuestion[];
      answers: Array<{
        question: string;
        audioData: Blob;
        feedback: string;
        score: number;
      }>;
    }): Promise<InterviewReview> => {
      const review = await interviewService.reviewInterview(questions, answers);

      // Save attempt to progress store
      saveAttempt({
        id: review.sessionId,
        jobRole: 'General', // You might want to pass this from the session
        difficulty: 'intermediate', // You might want to pass this from the session
        questionsCount: questions.length,
        completedAt: new Date(),
        duration: 0, // You might want to track this
        overallScore: review.overallScore,
        feedback: {
          overallScore: review.overallScore,
          strengths: review.strengths,
          weaknesses: review.weaknesses,
          improvements: [], // You might want to derive this from weaknesses
          recommendations: review.recommendations,
        },
      });

      return review;
    },
    onMutate: () => {
      console.log('📋 Generating interview review...');
      toast.loading('Generating interview review...', {
        id: 'interview-review',
        description: 'AI is preparing your performance analysis',
      });
    },
    onSuccess: (review) => {
      console.log('✅ Interview review generated:', review);
      toast.success('Interview review ready!', {
        id: 'interview-review',
        description: `Overall score: ${review.overallScore}%`,
        action: {
          label: 'View Review',
          onClick: () => {
            // Navigate to review page or scroll to review section
          },
        },
      });
    },
    onError: (error: Error) => {
      console.error('❌ Interview review generation failed:', error);
      toast.error('Failed to generate review', {
        id: 'interview-review',
        description: error.message || 'Please try again',
      });
    },
  });
};

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
    queryKey: ['interview-progress'],
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
 * React Query hook for getting interview by ID
 */
export const useInterviewById = (id: string | undefined) => {
  const { currentSession } = useInterviewSessionStore();

  return useQuery({
    queryKey: ['interview', id],
    queryFn: () => {
      // Simple implementation: check if current session matches the ID
      if (id && currentSession && currentSession.id === id) {
        return currentSession;
      }
      return null;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Mutation for clearing all interview data
 */
export const useClearInterviewDataMutation = () => {
  const { resetSession } = useInterviewSessionStore();
  const { clearHistory } = useInterviewProgressStore();

  return useMutation({
    mutationFn: () => {
      // Clear data from stores
      resetSession();
      clearHistory();
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

/**
 * Combined hook for interview operations
 */
export const useInterviewOperations = () => {
  const generateQuestions = useGenerateInterviewQuestionsMutation();
  const generateReview = useGenerateInterviewReviewMutation();
  const clearData = useClearInterviewDataMutation();

  return {
    generateQuestions,
    generateReview,
    clearData,
    isLoading: generateQuestions.isPending || generateReview.isPending,
    isError: generateQuestions.isError || generateReview.isError,
  };
};
