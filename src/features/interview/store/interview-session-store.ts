import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  InterviewQuestion,
  InterviewAnswer,
  AudioRecording,
  InterviewResult,
} from '../types';

// Interview Session Types
export interface InterviewSessionState {
  // Current session data
  currentSession: {
    id: string;
    jobRole: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    questions: InterviewQuestion[];
    answers: InterviewAnswer[];
    recordings: AudioRecording[];
    startTime: Date;
    endTime?: Date;
    currentQuestionIndex: number;
    status: 'active' | 'completed' | 'paused' | 'reviewing';
    testMode?: boolean; // Flag for test/mock mode
  } | null;

  // Audio state
  isRecording: boolean;
  recordingDuration: number;
  audioPermission: boolean;

  // Review state
  reviewResult: InterviewResult | null;
  isGeneratingReview: boolean;

  // UI state
  isProcessing: boolean;
  error: string | null;
}

export interface InterviewSessionActions {
  // Session management
  startSession: (config: {
    jobRole: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    questions: InterviewQuestion[];
    testMode?: boolean;
  }) => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;

  // Question navigation
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;

  // Answer management
  submitAnswer: (questionId: string, answer: string) => void;
  updateAnswer: (questionId: string, answer: string) => void;

  // Recording management
  startRecording: () => void;
  stopRecording: () => void;
  addRecording: (recording: AudioRecording) => void;

  // Review management
  completeInterview: () => void;
  setReviewResult: (result: InterviewResult) => void;
  setGeneratingReview: (isGenerating: boolean) => void;
  clearReview: () => void;

  // Audio permission
  setAudioPermission: (permission: boolean) => void;

  // UI state management
  setProcessing: (isProcessing: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: InterviewSessionState = {
  currentSession: null,
  isRecording: false,
  recordingDuration: 0,
  audioPermission: true,
  reviewResult: null,
  isGeneratingReview: false,
  isProcessing: false,
  error: null,
};

export const useInterviewSessionStore = create<
  InterviewSessionState & InterviewSessionActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Session management
      startSession: (config) => {
        const sessionId = `interview-${Date.now()}`;
        set({
          currentSession: {
            id: sessionId,
            jobRole: config.jobRole,
            difficulty: config.difficulty,
            questions: config.questions,
            answers: [],
            recordings: [],
            startTime: new Date(),
            currentQuestionIndex: 0,
            status: 'active',
            testMode: config.testMode || false,
          },
          error: null,
        });
        console.log('🎯 Interview session started:', sessionId, config.testMode ? '(TEST MODE)' : '');
      },

      endSession: () => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              endTime: new Date(),
              status: 'completed',
            },
          });
          console.log('🏁 Interview session completed:', currentSession.id);
        }
      },

      pauseSession: () => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              status: 'paused',
            },
          });
        }
      },

      resumeSession: () => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              status: 'active',
            },
          });
        }
      },

      resetSession: () => {
        set(initialState);
        console.log('🔄 Interview session reset');
      },

      // Question navigation
      nextQuestion: () => {
        const { currentSession } = get();
        if (
          currentSession &&
          currentSession.currentQuestionIndex <
            currentSession.questions.length - 1
        ) {
          set({
            currentSession: {
              ...currentSession,
              currentQuestionIndex: currentSession.currentQuestionIndex + 1,
            },
          });
        }
      },

      previousQuestion: () => {
        const { currentSession } = get();
        if (currentSession && currentSession.currentQuestionIndex > 0) {
          set({
            currentSession: {
              ...currentSession,
              currentQuestionIndex: currentSession.currentQuestionIndex - 1,
            },
          });
        }
      },

      goToQuestion: (index) => {
        const { currentSession } = get();
        if (
          currentSession &&
          index >= 0 &&
          index < currentSession.questions.length
        ) {
          set({
            currentSession: {
              ...currentSession,
              currentQuestionIndex: index,
            },
          });
        }
      },

      // Answer management
      submitAnswer: (questionId, answer) => {
        const { currentSession } = get();
        if (currentSession) {
          const newAnswer: InterviewAnswer = {
            questionId,
            answer,
            timestamp: new Date(),
          };

          const existingAnswerIndex = currentSession.answers.findIndex(
            (a) => a.questionId === questionId
          );

          let updatedAnswers;
          if (existingAnswerIndex >= 0) {
            updatedAnswers = [...currentSession.answers];
            updatedAnswers[existingAnswerIndex] = newAnswer;
          } else {
            updatedAnswers = [...currentSession.answers, newAnswer];
          }

          set({
            currentSession: {
              ...currentSession,
              answers: updatedAnswers,
            },
          });
        }
      },

      updateAnswer: (questionId, answer) => {
        const { currentSession } = get();
        if (currentSession) {
          const updatedAnswers = currentSession.answers.map((a) =>
            a.questionId === questionId ? { ...a, answer } : a
          );

          set({
            currentSession: {
              ...currentSession,
              answers: updatedAnswers,
            },
          });
        }
      },

      // Recording management
      startRecording: () => {
        set({ isRecording: true, recordingDuration: 0 });
      },

      stopRecording: () => {
        set({ isRecording: false });
      },

      addRecording: (recording) => {
        const { currentSession } = get();
        if (currentSession) {
          set({
            currentSession: {
              ...currentSession,
              recordings: [...currentSession.recordings, recording],
            },
          });
        }
      },

      // Audio permission
      setAudioPermission: (permission) => {
        set({ audioPermission: permission });
      },

      // UI state management
      setProcessing: (isProcessing) => {
        set({ isProcessing });
      },

      setError: (error) => {
        set({ error });
      },

      // Review management - UI state only
      completeInterview: () => {
        const { currentSession } = get();
        if (!currentSession) {
          set({ error: 'No active interview session' });
          return;
        }

        set({
          currentSession: {
            ...currentSession,
            status: 'reviewing',
            endTime: new Date(),
          },
        });
      },

      setReviewResult: (result: InterviewResult) => {
        const { currentSession } = get();
        set({
          reviewResult: result,
          isGeneratingReview: false,
          currentSession: currentSession
            ? {
                ...currentSession,
                status: 'completed',
              }
            : null,
        });
      },

      setGeneratingReview: (isGenerating: boolean) => {
        set({ isGeneratingReview: isGenerating });
      },

      clearReview: () => {
        set({ reviewResult: null });
      },
    }),
    {
      name: 'interview-session-store',
    }
  )
);
