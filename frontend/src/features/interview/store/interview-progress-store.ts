import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { InterviewFeedback } from '../types';

// Interview Progress Types
export interface InterviewAttempt {
  id: string;
  jobRole: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questionsCount: number;
  completedAt: Date;
  duration: number; // in seconds
  overallScore: number;
  feedback: InterviewFeedback;
}

export interface InterviewProgressState {
  // Interview attempts history
  attempts: InterviewAttempt[];

  // Statistics
  totalInterviews: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number; // in seconds

  // Progress tracking
  improvementAreas: string[];
  strengths: string[];

  // Recent activity
  lastInterviewDate: Date | null;
}

export interface InterviewProgressActions {
  // Attempt management
  saveAttempt: (attempt: InterviewAttempt) => void;
  getAttemptById: (id: string) => InterviewAttempt | undefined;
  getAttemptsByRole: (jobRole: string) => InterviewAttempt[];

  // Statistics calculation
  calculateStats: () => void;
  getProgressByRole: (jobRole: string) => {
    totalInterviews: number;
    averageScore: number;
    improvement: number; // percentage improvement from first to last
  };

  // Data management
  clearHistory: () => void;
  exportData: () => string;
}

const initialState: InterviewProgressState = {
  attempts: [],
  totalInterviews: 0,
  averageScore: 0,
  bestScore: 0,
  totalTimeSpent: 0,
  improvementAreas: [],
  strengths: [],
  lastInterviewDate: null,
};

export const useInterviewProgressStore = create<
  InterviewProgressState & InterviewProgressActions
>()(
  devtools(
    (set, get) => ({
      ...initialState,

      saveAttempt: (attempt) => {
        const state = get();
        const updatedAttempts = [...state.attempts, attempt];

        set({
          attempts: updatedAttempts,
          lastInterviewDate: attempt.completedAt,
        });

        // Recalculate stats
        get().calculateStats();
        console.log('✅ Interview attempt saved:', attempt.id);
      },

      getAttemptById: (id) => {
        const state = get();
        return state.attempts.find((attempt) => attempt.id === id);
      },

      getAttemptsByRole: (jobRole) => {
        const state = get();
        return state.attempts.filter((attempt) => attempt.jobRole === jobRole);
      },

      calculateStats: () => {
        const state = get();
        const attempts = state.attempts;

        if (attempts.length === 0) {
          set({
            totalInterviews: 0,
            averageScore: 0,
            bestScore: 0,
            totalTimeSpent: 0,
            improvementAreas: [],
            strengths: [],
          });
          return;
        }

        const totalInterviews = attempts.length;
        const averageScore =
          attempts.reduce((sum, attempt) => sum + attempt.overallScore, 0) /
          totalInterviews;
        const bestScore = Math.max(
          ...attempts.map((attempt) => attempt.overallScore)
        );
        const totalTimeSpent = attempts.reduce(
          (sum, attempt) => sum + attempt.duration,
          0
        );

        // Collect improvement areas and strengths from feedback
        const allImprovementAreas = attempts.flatMap(
          (attempt) => attempt.feedback.weaknesses
        );
        const allStrengths = attempts.flatMap(
          (attempt) => attempt.feedback.strengths
        );

        // Get unique items and sort by frequency
        const improvementAreas = [...new Set(allImprovementAreas)];
        const strengths = [...new Set(allStrengths)];

        set({
          totalInterviews,
          averageScore: Math.round(averageScore * 100) / 100,
          bestScore: Math.round(bestScore * 100) / 100,
          totalTimeSpent,
          improvementAreas,
          strengths,
        });
      },

      getProgressByRole: (jobRole) => {
        const state = get();
        const roleAttempts = state.attempts.filter(
          (attempt) => attempt.jobRole === jobRole
        );

        if (roleAttempts.length === 0) {
          return {
            totalInterviews: 0,
            averageScore: 0,
            improvement: 0,
          };
        }

        const totalInterviews = roleAttempts.length;
        const averageScore =
          roleAttempts.reduce((sum, attempt) => sum + attempt.overallScore, 0) /
          totalInterviews;

        // Calculate improvement from first to last
        const sortedAttempts = roleAttempts.sort(
          (a, b) => a.completedAt.getTime() - b.completedAt.getTime()
        );
        const firstScore = sortedAttempts[0].overallScore;
        const lastScore =
          sortedAttempts[sortedAttempts.length - 1].overallScore;
        const improvement =
          totalInterviews > 1
            ? ((lastScore - firstScore) / firstScore) * 100
            : 0;

        return {
          totalInterviews,
          averageScore: Math.round(averageScore * 100) / 100,
          improvement: Math.round(improvement * 100) / 100,
        };
      },

      clearHistory: () => {
        set(initialState);
        console.log('🗑️ Interview history cleared');
      },

      exportData: () => {
        const state = get();
        return JSON.stringify(
          {
            attempts: state.attempts,
            exportedAt: new Date().toISOString(),
            totalInterviews: state.totalInterviews,
            averageScore: state.averageScore,
            bestScore: state.bestScore,
          },
          null,
          2
        );
      },
    }),
    {
      name: 'interview-progress-store',
    }
  )
);
