// Main Quiz Store - Re-exports all quiz-related stores for convenience
export { 
  useQuizGeneratorStore, 
  type GenerateQuizInput,
  type QuizGeneratorState,
  type QuizGeneratorActions 
} from './quiz-generator-store';

export { 
  useQuizSessionStore, 
  useQuizSessionSelectors,
  type QuizSessionState,
  type QuizSessionActions
} from './quiz-session-store';

export { 
  useProgressStore, 
  useProgressSelectors,
  type ProgressState,
  type ProgressActions,
  type UserProgress,
  type TopicProgress
} from './progress-store';

export { 
  useQuizStore,
  type QuizCoordinatorState,
  type QuizCoordinatorActions
} from './quiz-coordinator-store';

export { 
  useQuizReviewStore, 
  useQuizReviewSelectors,
  convertSessionToReviewInput,
  type QuizReviewState,
  type QuizReviewActions
} from './quiz-review-store';

// Legacy exports for backward compatibility
export type { QuizAnswer } from '../type';
