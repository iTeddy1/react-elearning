import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { QuizReview, Quiz, QuizAnswer } from '@/types/quiz';
import { AIProvider } from '../services/ai';

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
  // Review generation
  generateReview: (
    quizPayload: string,
    userAnswers: (0 | 1 | 2 | 3 | null)[],
    quizId: number,
    language?: 'vi' | 'en'
  ) => Promise<void>;
  
  // State management
  clearReview: () => void;
  clearError: () => void;
  setReview: (review: QuizReview, quizId: number) => void;
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

      generateReview: async (
        quizPayload: string,
        userAnswers: (0 | 1 | 2 | 3 | null)[],
        quizId: number,
        language = 'en'
      ) => {
        set({
          isGeneratingReview: true,
          reviewError: null,
        });

        try {
          console.log('Generating review with payload:', {
            quizPayload: quizPayload.substring(0, 200) + '...',
            userAnswers,
            quizId,
            language,
          });

          // Parse quiz data to verify correctness
          const quizData = JSON.parse(quizPayload) as {
            items: Array<{ answerIndex: number }>;
          };
          console.log('Parsed quiz data:', quizData);
          
          // Calculate expected score manually for verification
          const correctAnswers = userAnswers.filter((answer, index) => {
            if (answer === null) return false;
            return answer === quizData.items[index]?.answerIndex;
          });
          
          console.log('Expected correct answers:', correctAnswers.length, '/', quizData.items.length);
          
          const reviewJson = await AIProvider.generateReview(
            quizPayload,
            userAnswers,
            language
          );

          console.log('Review JSON received:', reviewJson);

          const parsedReview = JSON.parse(reviewJson) as unknown;
          
          // Type guard for review validation
          if (!isValidQuizReview(parsedReview)) {
            throw new Error('Invalid review format received from AI');
          }

          const review: QuizReview = parsedReview;
          
          // Validate and potentially correct the AI's score calculation
          const expectedScore = correctAnswers.length;
          const expectedTotal = quizData.items.length;
          const expectedAccuracy = expectedTotal > 0 ? expectedScore / expectedTotal : 0;
          
          console.log('AI calculated score:', review.score, '/', review.total, 'accuracy:', review.accuracy);
          console.log('Expected score:', expectedScore, '/', expectedTotal, 'accuracy:', expectedAccuracy);
          
          // If AI calculation is wrong, correct it
          if (review.score !== expectedScore || review.total !== expectedTotal) {
            console.warn('AI score calculation was incorrect. Correcting...');
            review.score = expectedScore;
            review.total = expectedTotal;
            review.accuracy = expectedAccuracy;
          }

          set({
            currentReview: review,
            isGeneratingReview: false,
            reviewGeneratedAt: new Date(),
            quizId,
            reviewError: null,
          });

          console.log('Review generated successfully:', review);
        } catch (error) {
          console.error('Error generating review:', error);
          
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Failed to generate review. Please try again.';

          set({
            reviewError: errorMessage,
            isGeneratingReview: false,
            currentReview: null,
          });
        }
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

      setReview: (review: QuizReview, quizId: number) => {
        set({
          currentReview: review,
          quizId,
          reviewGeneratedAt: new Date(),
          reviewError: null,
        });
      },
    }),
    {
      name: 'quiz-review-store',
    }
  )
);

// Type guard for quiz review validation
function isValidQuizReview(obj: unknown): obj is QuizReview {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const review = obj as Record<string, unknown>;
  
  return (
    typeof review.score === 'number' &&
    typeof review.total === 'number' &&
    typeof review.accuracy === 'number' &&
    typeof review.comment === 'string' &&
    Array.isArray(review.recommendedTopics) &&
    Array.isArray(review.tips) &&
    (typeof review.perTagAccuracy === 'object' || review.perTagAccuracy === undefined)
  );
}

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
      ? Math.round((store.currentReview.score / store.currentReview.total) * 100)
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
    sessionAnswers: sessionAnswers
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
  sessionAnswers.forEach(answer => {
    answerMap.set(answer.questionId, answer.selectedOption);
  });

  const userAnswers: (0 | 1 | 2 | 3 | null)[] = quiz.questions.map((q) => {
    const selectedOption = answerMap.get(q.id);
    
    console.log(`Question ${q.id}: selected=${selectedOption}, correct=${q.correctAnswer}`);
    
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
  
  console.log(`Conversion verification: ${correctCount}/${quiz.questions.length} correct answers`);

  return { quizPayload, userAnswers };
};