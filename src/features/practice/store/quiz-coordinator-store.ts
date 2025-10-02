import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Quiz } from '../type';
import { useQuizGeneratorStore } from './quiz-generator-store';
import { useQuizSessionStore } from './quiz-session-store';
import { useProgressStore } from './progress-store';

// Re-export from other stores for convenience
export { useQuizGeneratorStore, type GenerateQuizInput } from './quiz-generator-store';
export { useQuizSessionStore, useQuizSessionSelectors } from './quiz-session-store';
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
          lastAction: 'quiz_started',
          lastActionTimestamp: new Date(),
        });

        // Start the quiz session
        const sessionStore = useQuizSessionStore.getState();
        sessionStore.startQuiz(quiz);
        
        get().logAction(`Quiz started: ${quiz.title}`);
      },

      endQuizFlow: () => {
        // End the current session
        const sessionStore = useQuizSessionStore.getState();
        if (sessionStore.isQuizActive) {
          sessionStore.endQuiz();
        }

        // Create and save quiz attempt to progress store
        const progressStore = useProgressStore.getState();
        if (sessionStore.currentQuiz) {
          const attempt = {
            id: Date.now(),
            quizId: sessionStore.currentQuiz.id,
            score: sessionStore.currentScore,
            completedAt: new Date().toISOString(),
            timeSpent: sessionStore.startTime && sessionStore.endTime
              ? Math.floor((sessionStore.endTime.getTime() - sessionStore.startTime.getTime()) / 1000)
              : 0,
            answers: sessionStore.answers,
            totalQuestions: sessionStore.currentQuiz.questions.length,
            percentage: sessionStore.currentScore,
          };
          
          progressStore.saveQuizAttempt(attempt);
        }

        set({
          isQuizFlowActive: false,
          currentQuizId: null,
          lastAction: 'quiz_completed',
          lastActionTimestamp: new Date(),
        });
        
        get().logAction('Quiz flow completed');
      },

      // Cross-store actions
      completeQuizSession: () => {
        const sessionStore = useQuizSessionStore.getState();
        
        if (sessionStore.isQuizActive) {
          // Calculate final results
          sessionStore.calculateScore();
          sessionStore.showQuizResults();
          
          // End the quiz flow
          get().endQuizFlow();
        }
      },

      resetAllStores: () => {
        // Reset all stores to initial state
        useQuizGeneratorStore.getState().resetGeneration();
        useQuizSessionStore.getState().resetQuiz();
        
        set({
          isQuizFlowActive: false,
          currentQuizId: null,
          lastAction: 'stores_reset',
          lastActionTimestamp: new Date(),
        });
        
        get().logAction('All stores reset');
      },

      // Action logging
      logAction: (action: string) => {
        console.log(`[Quiz Coordinator] ${new Date().toISOString()}: ${action}`);
        
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
