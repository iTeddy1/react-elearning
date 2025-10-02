import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Quiz } from '../type';

// Re-export from other stores for convenience
export { useQuizGeneratorStore, type GenerateQuizInput } from './quiz-generator-store';
export { useQuizSessionStore } from './quiz-session-store';
export { useProgressStore, useProgressSelectors } from './progress-store';

// Main coordinator store - handles communication between stores
export interface QuizCoordinatorState {
  // Current active quiz flow
  isQuizFlowActive: boolean;
  currentQuizId: number | null;
  
  // Cross-store communication
  lastAction: string | null;
  lastActionTimestamp: Date | null;
}

export interface QuizCoordinatorActions {
  // Quiz flow coordination
  startQuizFlow: (quiz: Quiz) => void;
  endQuizFlow: () => void;
  
  // Cross-store actions
  completeQuizSession: () => void;
  resetAllStores: () => void;
  
  // Action logging
  logAction: (action: string) => void;
}

const initialState: QuizCoordinatorState = {
  isQuizFlowActive: false,
  currentQuizId: null,
  lastAction: null,
  lastActionTimestamp: null,
};

export const useQuizStore = create<QuizCoordinatorState & QuizCoordinatorActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Quiz flow coordination
      startQuizFlow: (quiz: Quiz) => {
        set({
          isQuizFlowActive: true,
          currentQuizId: quiz.id,
          lastAction: 'startQuizFlow',
          lastActionTimestamp: new Date(),
        });
      },

      endQuizFlow: () => {
        set({
          isQuizFlowActive: false,
          currentQuizId: null,
          lastAction: 'endQuizFlow',
          lastActionTimestamp: new Date(),
        });
      },

      completeQuizSession: () => {
        // This will be called when a quiz session ends
        // It coordinates between session and progress stores
        get().logAction('completeQuizSession');
        get().endQuizFlow();
      },

      resetAllStores: () => {
        // Reset all stores - useful for testing or full reset
        set({
          ...initialState,
          lastAction: 'resetAllStores',
          lastActionTimestamp: new Date(),
        });
      },

      logAction: (action: string) => {
        set({
          lastAction: action,
          lastActionTimestamp: new Date(),
        });
      },
    }),
    {
      name: 'quiz-coordinator-store',
    }
  )
);
