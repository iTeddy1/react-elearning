import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { InterviewAttempt } from './interview-progress-store';

// Main coordinator store - handles communication between interview stores
export interface InterviewCoordinatorState {
  // Current active interview flow
  isInterviewFlowActive: boolean;
  currentInterviewId: string | null;
  
  // Cross-store communication
  lastAction: string | null;
  lastActionTimestamp: Date | null;
}

export interface InterviewCoordinatorActions {
  // Interview flow coordination
  startInterviewFlow: (jobRole: string, difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
  endInterviewFlow: () => void;
  
  // Cross-store actions
  completeInterviewSession: (attempt: InterviewAttempt) => void;
  resetAllStores: () => void;
  
  // Action logging
  logAction: (action: string) => void;
}

const initialState: InterviewCoordinatorState = {
  isInterviewFlowActive: false,
  currentInterviewId: null,
  lastAction: null,
  lastActionTimestamp: null,
};

export const useInterviewStore = create<InterviewCoordinatorState & InterviewCoordinatorActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Interview flow coordination
      startInterviewFlow: (jobRole: string, difficulty: 'beginner' | 'intermediate' | 'advanced') => {
        const interviewId = `interview-${Date.now()}`;
        set({
          isInterviewFlowActive: true,
          currentInterviewId: interviewId,
        });
        
        get().logAction(`Started interview flow for ${jobRole} (${difficulty})`);
        console.log('🚀 Interview flow started:', interviewId);
      },

      endInterviewFlow: () => {
        const { currentInterviewId } = get();
        set({
          isInterviewFlowActive: false,
          currentInterviewId: null,
        });
        
        get().logAction('Ended interview flow');
        console.log('🏁 Interview flow ended:', currentInterviewId);
      },

      // Cross-store actions
      completeInterviewSession: (attempt: InterviewAttempt) => {
        // This would typically trigger actions across multiple stores
        // For now, we'll just log the completion
        get().logAction(`Completed interview session: ${attempt.id}`);
        console.log('✅ Interview session completed:', attempt.id);
        
        // End the flow
        get().endInterviewFlow();
      },

      resetAllStores: () => {
        // This would reset all interview-related stores
        // We'll import and use the stores' reset methods
        set(initialState);
        get().logAction('Reset all interview stores');
      },

      // Action logging
      logAction: (action: string) => {
        set({
          lastAction: action,
          lastActionTimestamp: new Date(),
        });
      },
    }),
    {
      name: 'interview-coordinator-store',
    }
  )
);

// Re-export all stores for convenience
export { useInterviewSessionStore } from './interview-session-store';
export { useInterviewGeneratorStore } from './interview-generator-store';
export { useInterviewProgressStore } from './interview-progress-store';