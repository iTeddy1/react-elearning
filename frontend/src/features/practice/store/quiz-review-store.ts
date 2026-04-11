import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { QuizReview, Quiz, QuizAnswer } from '../types';

export interface QuizReviewState {
  // Review data
  currentReview: QuizReview | null;

  // Loading states
  isGeneratingReview: boolean;
  reviewError: string | null;

  // Review metadata
  reviewGeneratedAt: Date | null;
  quizId: number | null;
}

export interface QuizReviewActions {
  // State management - UI only
  setReview: (review: QuizReview, quizId: number) => void;
  setGeneratingReview: (isGenerating: boolean) => void;
  setReviewError: (error: string | null) => void;
  clearReview: () => void;
  clearError: () => void;
}

const initialState: QuizReviewState = {
  currentReview: null,
  isGeneratingReview: false,
  reviewError: null,
  reviewGeneratedAt: null,
  quizId: null,
};

export const useQuizReviewStore = create<QuizReviewState & QuizReviewActions>()(
  devtools(
    (set) => ({
      ...initialState,

      // UI state management only - no AI calls
      setReview: (review: QuizReview, quizId: number) => {
        set({
          currentReview: review,
          quizId,
          reviewGeneratedAt: new Date(),
          reviewError: null,
          isGeneratingReview: false,
        });
      },

      setGeneratingReview: (isGenerating: boolean) => {
        set({ isGeneratingReview: isGenerating });
      },

      setReviewError: (error: string | null) => {
        set({
          reviewError: error,
          isGeneratingReview: false,
        });
      },

      clearReview: () => {
        set({
          currentReview: null,
          reviewGeneratedAt: null,
          quizId: null,
          reviewError: null,
        });
      },

      clearError: () => {
        set({ reviewError: null });
      },
    }),
    {
      name: 'quiz-review-store',
    }
  )
);

// Selectors for quiz review
export const useQuizReviewSelectors = () => {
  const store = useQuizReviewStore();

  return {
    // Review data
    review: store.currentReview,
    isLoading: store.isGeneratingReview,
    error: store.reviewError,

    // Metadata
    generatedAt: store.reviewGeneratedAt,
    forQuizId: store.quizId,

    // Computed values
    hasReview: !!store.currentReview,
    scorePercentage: store.currentReview
      ? Math.round(
          (store.currentReview.score / store.currentReview.total) * 100
        )
      : 0,
    accuracy: store.currentReview?.accuracy || 0,

    // Performance insights
    strongTags: store.currentReview?.perTagAccuracy
      ? Object.entries(store.currentReview.perTagAccuracy)
          .filter(([, accuracy]) => accuracy >= 0.8)
          .map(([tag]) => tag)
      : [],
    weakTags: store.currentReview?.perTagAccuracy
      ? Object.entries(store.currentReview.perTagAccuracy)
          .filter(([, accuracy]) => accuracy < 0.6)
          .map(([tag]) => tag)
      : [],
  };
};

// Helper function to convert quiz session data to review input format
export const convertSessionToReviewInput = (
  quiz: Quiz,
  sessionAnswers: QuizAnswer[]
): {
  quizPayload: string;
  userAnswers: (0 | 1 | 2 | 3 | null)[];
} => {
  console.log('Converting session data:', {
    quiz: quiz.title,
    totalQuestions: quiz.questions.length,
    sessionAnswers: sessionAnswers,
  });

  // Create quiz payload in the format expected by AI
  const quizPayload = JSON.stringify({
    meta: {
      topic: quiz.title || 'React Quiz',
      difficulty: quiz.difficulty || 'intermediate',
      language: 'en',
      numQuestions: quiz.questions.length,
    },
    items: quiz.questions.map((q) => ({
      id: q.id.toString(),
      question: q.question,
      choices: q.options,
      answerIndex: q.correctAnswer,
      explanation: q.explanation,
      tags: q.tags || ['react'],
    })),
  });

  // Convert session answers to the format expected by AI
  // Map answers by question ID to ensure correct alignment
  const answerMap = new Map<number, number>();
  sessionAnswers.forEach((answer) => {
    answerMap.set(answer.questionId, answer.selectedOption);
  });

  const userAnswers: (0 | 1 | 2 | 3 | null)[] = quiz.questions.map((q) => {
    const selectedOption = answerMap.get(q.id);

    console.log(
      `Question ${q.id}: selected=${selectedOption}, correct=${q.correctAnswer}`
    );

    if (selectedOption === undefined || selectedOption === null) return null;

    // Ensure the answer is within valid range
    if (selectedOption >= 0 && selectedOption <= 3) {
      return selectedOption as 0 | 1 | 2 | 3;
    }
    return null;
  });

  console.log('Final user answers array:', userAnswers);

  // Verify the mapping is correct
  const correctCount = userAnswers.filter((answer, index) => {
    return answer !== null && answer === quiz.questions[index].correctAnswer;
  }).length;

  console.log(
    `Conversion verification: ${correctCount}/${quiz.questions.length} correct answers`
  );

  return { quizPayload, userAnswers };
};
