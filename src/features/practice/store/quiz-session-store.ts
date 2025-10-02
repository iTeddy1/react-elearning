import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Quiz, QuizAnswer } from '../type';

export interface QuizSessionState {
  // Current quiz session
  currentQuiz: Quiz | null;
  currentQuestionIndex: number;
  answers: QuizAnswer[];
  startTime: Date | null;
  endTime: Date | null;
  isQuizActive: boolean;
  isPaused: boolean;
  
  // Timer management
  timeRemaining: number;
  questionStartTime: Date | null;
  
  // Quiz results
  currentScore: number;
  showResults: boolean;
  showExplanation: boolean;
}

export interface QuizSessionActions {
  // Quiz session management
  startQuiz: (quiz: Quiz) => void;
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  endQuiz: () => void;
  resetQuiz: () => void;
  
  // Question navigation
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  
  // Answer management
  submitAnswer: (questionId: number, selectedOption: number) => void;
  updateAnswer: (questionId: number, selectedOption: number) => void;
  clearAnswer: (questionId: number) => void;
  
  // Results and scoring
  calculateScore: () => void;
  showQuizResults: () => void;
  hideQuizResults: () => void;
  
  // Timer management
  updateTimeRemaining: (time: number) => void;
  resetTimer: () => void;
  startQuestionTimer: () => void;
  
  // UI state management
  toggleExplanation: () => void;
  setShowExplanation: (show: boolean) => void;
}

const initialState: QuizSessionState = {
  // Current quiz session
  currentQuiz: null,
  currentQuestionIndex: 0,
  answers: [],
  startTime: null,
  endTime: null,
  isQuizActive: false,
  isPaused: false,
  
  // Timer management
  timeRemaining: 0,
  questionStartTime: null,
  
  // Quiz results
  currentScore: 0,
  showResults: false,
  showExplanation: false,
};

export const useQuizSessionStore = create<QuizSessionState & QuizSessionActions>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Quiz session management
      startQuiz: (quiz: Quiz) => {
        set({
          currentQuiz: quiz,
          currentQuestionIndex: 0,
          answers: [],
          startTime: new Date(),
          endTime: null,
          isQuizActive: true,
          isPaused: false,
          timeRemaining: quiz.timeLimit * 60, // Convert minutes to seconds
          currentScore: 0,
          showResults: false,
          questionStartTime: new Date(),
        });
      },

      pauseQuiz: () => {
        set({ isPaused: true });
      },

      resumeQuiz: () => {
        set({ isPaused: false });
      },

      endQuiz: () => {
        const state = get();
        set({
          endTime: new Date(),
          isQuizActive: false,
          isPaused: false,
        });
        // Calculate final score
        state.calculateScore();
        state.showQuizResults();
      },

      resetQuiz: () => {
        set(initialState);
      },

      // Question navigation
      nextQuestion: () => {
        const state = get();
        if (state.currentQuiz && state.currentQuestionIndex < state.currentQuiz.questions.length - 1) {
          set({
            currentQuestionIndex: state.currentQuestionIndex + 1,
            questionStartTime: new Date(),
          });
        } else if (state.currentQuiz && state.currentQuestionIndex === state.currentQuiz.questions.length - 1) {
          // Last question, end quiz
          state.endQuiz();
        }
      },

      previousQuestion: () => {
        const state = get();
        if (state.currentQuestionIndex > 0) {
          set({
            currentQuestionIndex: state.currentQuestionIndex - 1,
            questionStartTime: new Date(),
          });
        }
      },

      goToQuestion: (index: number) => {
        const state = get();
        if (state.currentQuiz && index >= 0 && index < state.currentQuiz.questions.length) {
          set({
            currentQuestionIndex: index,
            questionStartTime: new Date(),
          });
        }
      },

      // Answer management
      submitAnswer: (questionId: number, selectedOption: number) => {
        const state = get();
        const question = state.currentQuiz?.questions.find(q => q.id === questionId);
        
        if (question && state.questionStartTime) {
          const isCorrect = selectedOption === question.correctAnswer;
          const timeSpent = Math.floor((new Date().getTime() - state.questionStartTime.getTime()) / 1000);
          
          const newAnswer: QuizAnswer = {
            questionId,
            selectedOption,
            isCorrect,
            timeSpent,
          };

          const updatedAnswers = state.answers.filter(a => a.questionId !== questionId);
          updatedAnswers.push(newAnswer);

          set({ answers: updatedAnswers });
          
          // Auto-calculate score after each answer
          state.calculateScore();
        }
      },

      updateAnswer: (questionId: number, selectedOption: number) => {
        // Same logic as submitAnswer
        get().submitAnswer(questionId, selectedOption);
      },

      clearAnswer: (questionId: number) => {
        const state = get();
        const updatedAnswers = state.answers.filter(a => a.questionId !== questionId);
        set({ answers: updatedAnswers });
        state.calculateScore();
      },

      // Results and scoring
      calculateScore: () => {
        const state = get();
        const correctAnswers = state.answers.filter(answer => answer.isCorrect).length;
        const totalQuestions = state.currentQuiz?.questions.length || 0;
        const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

        set({ currentScore: score });
      },

      showQuizResults: () => {
        set({ showResults: true });
      },

      hideQuizResults: () => {
        set({ showResults: false });
      },

      // Timer management
      updateTimeRemaining: (time: number) => {
        const state = get();
        if (time <= 0 && state.isQuizActive) {
          // Time's up, end quiz
          state.endQuiz();
        } else {
          set({ timeRemaining: Math.max(0, time) });
        }
      },

      resetTimer: () => {
        const state = get();
        set({ timeRemaining: (state.currentQuiz?.timeLimit || 0) * 60 });
      },

      startQuestionTimer: () => {
        set({ questionStartTime: new Date() });
      },

      // UI state management
      toggleExplanation: () => {
        const state = get();
        set({ showExplanation: !state.showExplanation });
      },

      setShowExplanation: (show: boolean) => {
        set({ showExplanation: show });
      },
    }),
    {
      name: 'quiz-session-store',
    }
  )
);

// Selectors for quiz session
export const useQuizSessionSelectors = () => {
  const store = useQuizSessionStore();

  return {
    // Current quiz info
    currentQuiz: store.currentQuiz,
    currentQuestion: store.currentQuiz?.questions[store.currentQuestionIndex] || null,
    isLastQuestion: store.currentQuiz
      ? store.currentQuestionIndex === store.currentQuiz.questions.length - 1
      : false,
    isFirstQuestion: store.currentQuestionIndex === 0,
    
    // Progress info
    progress: store.currentQuiz
      ? Math.round(((store.currentQuestionIndex + 1) / store.currentQuiz.questions.length) * 100)
      : 0,
    answeredQuestions: store.answers.length,
    totalQuestions: store.currentQuiz?.questions.length || 0,
    
    // Quiz state
    canNavigate: store.isQuizActive && !store.isPaused,
    hasAnswered: (questionId: number) => store.answers.some(a => a.questionId === questionId),
    getAnswer: (questionId: number) => store.answers.find(a => a.questionId === questionId),
    
    // Session info
    sessionDuration: store.startTime && store.endTime
      ? Math.floor((store.endTime.getTime() - store.startTime.getTime()) / 1000)
      : 0,
    isSessionActive: store.isQuizActive,
  };
};
