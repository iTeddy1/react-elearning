import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { QuizAttempt } from '../type';

export interface UserProgress {
  totalQuizzesCompleted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  totalTimeSpent: number; // in seconds
  streakCount: number;
  lastQuizDate: Date | null;
}

export interface TopicProgress {
  topicId: number;
  topicName: string;
  quizzesCompleted: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  lastAttemptDate: Date | null;
}

export interface ProgressState {
  // User overall progress
  userProgress: UserProgress;
  
  // Topic-specific progress
  topicProgress: TopicProgress[];
  
  // Quiz attempts history
  quizAttempts: QuizAttempt[];
  
  // UI filters and settings
  selectedDifficulty: string;
  selectedTopic: string;
  sortBy: 'date' | 'score' | 'topic';
  sortOrder: 'asc' | 'desc';
}

export interface ProgressActions {
  // Quiz attempts management
  saveQuizAttempt: (attempt: QuizAttempt) => void;
  getQuizAttempts: (quizId?: number) => QuizAttempt[];
  getAttemptsByTopic: (topicId: number) => QuizAttempt[];
  getRecentAttempts: (limit?: number) => QuizAttempt[];
  clearQuizHistory: () => void;
  
  // Statistics calculation
  updateUserProgress: () => void;
  updateTopicProgress: (topicId: number, topicName: string) => void;
  calculateStreak: () => void;
  
  // Progress tracking
  getProgressByDifficulty: (difficulty: string) => {
    completed: number;
    averageScore: number;
  };
  
  // UI state management
  setSelectedDifficulty: (difficulty: string) => void;
  setSelectedTopic: (topic: string) => void;
  setSortBy: (sortBy: 'date' | 'score' | 'topic') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Achievement tracking
  checkAchievements: () => Array<{
    type: string;
    title: string;
    description: string;
    unlockedAt: Date;
  }>;
  
  // Data export/import
  exportProgress: () => string;
  importProgress: (data: string) => void;
  resetProgress: () => void;
}

const initialUserProgress: UserProgress = {
  totalQuizzesCompleted: 0,
  totalQuestionsAnswered: 0,
  correctAnswers: 0,
  averageScore: 0,
  bestScore: 0,
  worstScore: 100,
  totalTimeSpent: 0,
  streakCount: 0,
  lastQuizDate: null,
};

const initialState: ProgressState = {
  // User overall progress
  userProgress: initialUserProgress,
  
  // Topic-specific progress
  topicProgress: [],
  
  // Quiz attempts history
  quizAttempts: [],
  
  // UI filters and settings
  selectedDifficulty: 'all',
  selectedTopic: 'all',
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useProgressStore = create<ProgressState & ProgressActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Quiz attempts management
        saveQuizAttempt: (attempt: QuizAttempt) => {
          const state = get();
          const updatedAttempts = [attempt, ...state.quizAttempts];
          
          set({ quizAttempts: updatedAttempts });
          
          // Update user progress and topic progress
          get().updateUserProgress();
          
          // Update topic progress if topicId is available
          if (attempt.topicId && attempt.topicName) {
            get().updateTopicProgress(attempt.topicId, attempt.topicName);
          }
          
          // Recalculate streak
          get().calculateStreak();
        },

        getQuizAttempts: (quizId?: number) => {
          const state = get();
          if (quizId) {
            return state.quizAttempts.filter(attempt => attempt.quizId === quizId);
          }
          return state.quizAttempts;
        },

        getAttemptsByTopic: (topicId: number) => {
          const state = get();
          return state.quizAttempts.filter(attempt => attempt.topicId === topicId);
        },

        getRecentAttempts: (limit = 10) => {
          const state = get();
          return state.quizAttempts
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
            .slice(0, limit);
        },

        clearQuizHistory: () => {
          set({
            quizAttempts: [],
            userProgress: initialUserProgress,
            topicProgress: [],
          });
        },

        // Statistics calculation
        updateUserProgress: () => {
          const state = get();
          const attempts = state.quizAttempts;

          if (attempts.length === 0) {
            set({ userProgress: initialUserProgress });
            return;
          }

          const totalQuizzesCompleted = attempts.length;
          const totalScore = attempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
          const averageScore = Math.round(totalScore / totalQuizzesCompleted);
          const bestScore = Math.max(...attempts.map(attempt => attempt.percentage));
          const worstScore = Math.min(...attempts.map(attempt => attempt.percentage));
          const totalTimeSpent = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
          const totalQuestionsAnswered = attempts.reduce((sum, attempt) => sum + attempt.totalQuestions, 0);
          const correctAnswers = attempts.reduce((sum, attempt) => {
            return sum + Math.round((attempt.percentage / 100) * attempt.totalQuestions);
          }, 0);

          const lastQuizDate = attempts.length > 0 
            ? new Date(attempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0].completedAt)
            : null;

          set({
            userProgress: {
              totalQuizzesCompleted,
              totalQuestionsAnswered,
              correctAnswers,
              averageScore,
              bestScore,
              worstScore,
              totalTimeSpent,
              streakCount: state.userProgress.streakCount, // Keep current streak
              lastQuizDate,
            }
          });
        },

        updateTopicProgress: (topicId: number, topicName: string) => {
          const state = get();
          const topicAttempts = state.quizAttempts.filter(attempt => attempt.topicId === topicId);
          
          if (topicAttempts.length === 0) return;

          const averageScore = Math.round(
            topicAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / topicAttempts.length
          );
          const bestScore = Math.max(...topicAttempts.map(attempt => attempt.percentage));
          const totalTimeSpent = topicAttempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0);
          const lastAttemptDate = new Date(
            topicAttempts.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0].completedAt
          );

          const existingProgressIndex = state.topicProgress.findIndex(tp => tp.topicId === topicId);
          
          const updatedTopicProgress = {
            topicId,
            topicName,
            quizzesCompleted: topicAttempts.length,
            averageScore,
            bestScore,
            totalTimeSpent,
            lastAttemptDate,
          };

          if (existingProgressIndex >= 0) {
            // Update existing topic progress
            const updatedProgress = [...state.topicProgress];
            updatedProgress[existingProgressIndex] = updatedTopicProgress;
            set({ topicProgress: updatedProgress });
          } else {
            // Add new topic progress
            set({ 
              topicProgress: [...state.topicProgress, updatedTopicProgress]
            });
          }
        },

        calculateStreak: () => {
          const state = get();
          const attempts = state.quizAttempts
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

          let currentStreak = 0;
          const passingScore = 70; // 70% to maintain streak

          for (const attempt of attempts) {
            if (attempt.percentage >= passingScore) {
              currentStreak++;
            } else {
              break; // Streak broken
            }
          }

          set({
            userProgress: {
              ...state.userProgress,
              streakCount: currentStreak,
            }
          });
        },

        // Progress tracking
        getProgressByDifficulty: (difficulty: string) => {
          const state = get();
          const difficultyAttempts = state.quizAttempts.filter(
            attempt => attempt.difficulty?.toLowerCase() === difficulty.toLowerCase()
          );
          
          const completed = difficultyAttempts.length;
          const averageScore = completed > 0 
            ? Math.round(difficultyAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0) / completed)
            : 0;

          return { completed, averageScore };
        },

        // UI state management
        setSelectedDifficulty: (difficulty: string) => {
          set({ selectedDifficulty: difficulty });
        },

        setSelectedTopic: (topic: string) => {
          set({ selectedTopic: topic });
        },

        setSortBy: (sortBy: 'date' | 'score' | 'topic') => {
          set({ sortBy });
        },

        setSortOrder: (order: 'asc' | 'desc') => {
          set({ sortOrder: order });
        },

        // Achievement tracking
        checkAchievements: () => {
          const state = get();
          const achievements = [];
          const progress = state.userProgress;

          // First quiz achievement
          if (progress.totalQuizzesCompleted >= 1) {
            achievements.push({
              type: 'first_quiz',
              title: 'Getting Started!',
              description: 'Completed your first quiz',
              unlockedAt: new Date(),
            });
          }

          // Perfect score achievement
          if (progress.bestScore === 100) {
            achievements.push({
              type: 'perfect_score',
              title: 'Perfect!',
              description: 'Achieved a perfect score',
              unlockedAt: new Date(),
            });
          }

          // Streak achievements
          if (progress.streakCount >= 5) {
            achievements.push({
              type: 'streak_5',
              title: 'On Fire!',
              description: 'Maintained a 5-quiz streak',
              unlockedAt: new Date(),
            });
          }

          if (progress.streakCount >= 10) {
            achievements.push({
              type: 'streak_10',
              title: 'Unstoppable!',
              description: 'Maintained a 10-quiz streak',
              unlockedAt: new Date(),
            });
          }

          // Quiz count achievements
          if (progress.totalQuizzesCompleted >= 10) {
            achievements.push({
              type: 'quiz_10',
              title: 'Dedicated Learner',
              description: 'Completed 10 quizzes',
              unlockedAt: new Date(),
            });
          }

          return achievements;
        },

        // Data export/import
        exportProgress: () => {
          const state = get();
          const exportData = {
            userProgress: state.userProgress,
            topicProgress: state.topicProgress,
            quizAttempts: state.quizAttempts,
            exportedAt: new Date().toISOString(),
            version: '1.0',
          };
          
          return JSON.stringify(exportData, null, 2);
        },

        importProgress: (data: string) => {
          try {
            const parsed: unknown = JSON.parse(data);
            
            // Type guard for imported data
            if (
              typeof parsed === 'object' && 
              parsed !== null &&
              'version' in parsed &&
              parsed.version === '1.0'
            ) {
              const importedData = parsed as {
                version: string;
                userProgress: UserProgress;
                topicProgress: TopicProgress[];
                quizAttempts: QuizAttempt[];
              };

              set({
                userProgress: importedData.userProgress || initialUserProgress,
                topicProgress: importedData.topicProgress || [],
                quizAttempts: importedData.quizAttempts || [],
              });
            } else {
              throw new Error('Unsupported data version');
            }
          } catch (error) {
            console.error('Failed to import progress data:', error);
            throw new Error('Invalid progress data format');
          }
        },

        resetProgress: () => {
          set({
            userProgress: initialUserProgress,
            topicProgress: [],
            quizAttempts: [],
          });
        },
      }),
      {
        name: 'quiz-progress-storage', // Key for localStorage
        partialize: (state) => ({
          userProgress: state.userProgress,
          topicProgress: state.topicProgress,
          quizAttempts: state.quizAttempts,
        }), // Only persist progress data, not UI state
      }
    ),
    {
      name: 'quiz-progress-store',
    }
  )
);

// Selectors for progress analytics
export const useProgressSelectors = () => {
  const store = useProgressStore();
  
  return {
    // Overall stats
    overallStats: store.userProgress,
    
    // Performance analytics
    accuracy: store.userProgress.totalQuestionsAnswered > 0
      ? Math.round((store.userProgress.correctAnswers / store.userProgress.totalQuestionsAnswered) * 100)
      : 0,
      
    averageTimePerQuiz: store.userProgress.totalQuizzesCompleted > 0
      ? Math.round(store.userProgress.totalTimeSpent / store.userProgress.totalQuizzesCompleted)
      : 0,
      
    // Topic performance
    topTopics: store.topicProgress
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5),
      
    weakestTopics: store.topicProgress
      .sort((a, b) => a.averageScore - b.averageScore)
      .slice(0, 5),
      
    // Recent activity
    recentActivity: store.quizAttempts
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
      .slice(0, 10),
      
    // Streak info
    currentStreak: store.userProgress.streakCount,
    isOnStreak: store.userProgress.streakCount > 0,
    
    // Progress by difficulty
    difficultyBreakdown: {
      beginner: store.quizAttempts.filter(attempt => 
        attempt.difficulty?.toLowerCase() === 'beginner'
      ).length,
      intermediate: store.quizAttempts.filter(attempt => 
        attempt.difficulty?.toLowerCase() === 'intermediate'
      ).length,
      advanced: store.quizAttempts.filter(attempt => 
        attempt.difficulty?.toLowerCase() === 'advanced'
      ).length,
    },
  };
};
