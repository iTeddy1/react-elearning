import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  InterviewQuestion,
  InterviewAnswer,
  AudioRecording,
  InterviewResult,
} from '../types';
import { InterviewAIService } from '../services/ai/interview-ai-service';

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
  completeInterviewAndGenerateReview: () => Promise<void>;
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

// Initialize AI service for reviews
const aiService = new InterviewAIService({
  apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY || '',
  model: 'gemini-2.0-flash-exp',
});

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
          },
          error: null,
        });
        console.log('🎯 Interview session started:', sessionId);
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

      // Review management
      completeInterviewAndGenerateReview: async () => {
        const { currentSession } = get();
        if (!currentSession || currentSession.recordings.length === 0) {
          set({ error: 'No interview data to review' });
          return;
        }

        try {
          // Set reviewing status
          set({
            currentSession: {
              ...currentSession,
              status: 'reviewing',
              endTime: new Date(),
            },
            isGeneratingReview: true,
            error: null,
          });

          console.log('🔄 Starting interview review generation...');

          // Prepare answers for AI service
          const answers = currentSession.recordings.map((recording, index) => {
            const question = currentSession.questions.find(
              (q) => q.id === recording.questionId
            );
            return {
              questionId: recording.questionId,
              questionIndex: index,
              question: question?.question || '',
              expectedTopics: question?.expectedTopics || [],
              audioBlob: recording.audioBlob,
              duration: recording.duration,
              recordedAt: recording.timestamp.toISOString(),
              metadata: {
                category: question?.category || 'General',
                difficulty: question?.difficulty || 'intermediate',
              },
            };
          });

          // Generate review using AI service
          const aiReview = await aiService.reviewInterview({
            questions: currentSession.questions.map((q) => ({
              id: q.id,
              category: q.category,
              question: q.question,
              difficulty: (q.difficulty.charAt(0).toUpperCase() +
                q.difficulty.slice(1)) as
                | 'Beginner'
                | 'Intermediate'
                | 'Advanced',
              expectedTopics: q.expectedTopics,
              followUpQuestions: q.followUpQuestions,
            })),
            answers,
            role: currentSession.jobRole,
            language: 'en',
            interviewMetadata: {
              interviewId: currentSession.id,
              interviewDate: currentSession.startTime.toISOString(),
              totalDuration: Math.floor(
                (new Date().getTime() - currentSession.startTime.getTime()) /
                  1000
              ),
              environment: 'web',
            },
          });

          console.log('✅ AI Review generated:', aiReview);

          // Transform AI review to InterviewResult format
          const result: InterviewResult = {
            questions: currentSession.questions.map((q, index) => {
              const analysis = aiReview.questionAnalysis.find(
                (qa) => qa.questionIndex === index
              );
              const recording = currentSession.recordings.find(
                (r) => r.questionId === q.id
              );
              return {
                questionId: q.id,
                question: q.question,
                response: recording ? 'Audio response recorded' : 'No response',
                grammar: null, // AI service doesn't provide detailed grammar breakdown
                contentRelevancy: {
                  score: analysis?.score || 0,
                  improvement: analysis?.weaknesses || [],
                  reason:
                    analysis?.feedback || 'No detailed feedback available',
                },
              };
            }),
            scores: {
              grammarScore: aiReview.scores.communicationSkills,
              communicationScore: aiReview.scores.communicationSkills,
              totalRelevancyScore: aiReview.scores.technicalKnowledge,
              overallInterviewScore: aiReview.overallScore,
              professionalismScore: aiReview.scores.professionalism,
              sociabilityScore: aiReview.scores.overallFit,
              energyLevelScore: Math.round(
                (aiReview.scores.communicationSkills +
                  aiReview.scores.professionalism) /
                  2
              ),
            },
            communication_breakdown: [
              {
                name: 'Technical Knowledge',
                definition:
                  'Assessment of technical understanding and accuracy',
                score: aiReview.scores.technicalKnowledge,
                reasoning:
                  'Evaluation based on depth and correctness of technical responses',
              },
              {
                name: 'Communication Skills',
                definition: 'Clarity, structure, and articulation of responses',
                score: aiReview.scores.communicationSkills,
                reasoning:
                  'Assessment of how effectively ideas were communicated',
              },
              {
                name: 'Problem Solving',
                definition: 'Analytical thinking and approach to challenges',
                score: aiReview.scores.problemSolving,
                reasoning:
                  'Evaluation of logical reasoning and solution approach',
              },
            ],
            relevancy_score_breakdown: currentSession.questions.map(
              (q, index) => {
                const analysis = aiReview.questionAnalysis.find(
                  (qa) => qa.questionIndex === index
                );
                return {
                  questionId: q.id,
                  question: q.question,
                  answer: 'Audio response',
                  relevancy_score: analysis?.score || 0,
                  relevancy_type: q.category,
                  reason:
                    analysis?.feedback || 'No detailed feedback available',
                  improvements: analysis?.weaknesses || [],
                  extracted_ideal_answer: q.expectedTopics.join(', '),
                  strengths: analysis?.strengths || [],
                };
              }
            ),
            grammar_score_breakdown: [], // AI service doesn't provide specific grammar breakdown
            overallSummary: {
              overall_summary: aiReview.overallFeedback.summary,
              transcript_summary:
                'Interview completed with audio responses analyzed by AI',
              strengths: aiReview.overallFeedback.strengths,
              weaknesses: aiReview.overallFeedback.weaknesses,
              key_insights: aiReview.overallFeedback.recommendations,
              recommendation:
                aiReview.overallFeedback.decision === 'RECOMMEND'
                  ? 'YES - Strong candidate'
                  : aiReview.overallFeedback.decision === 'MAYBE'
                    ? 'MAYBE - Conditional recommendation'
                    : 'NO - Additional development needed',
            },
          };

          // Update state with completed review
          set({
            currentSession: {
              ...currentSession,
              status: 'completed',
            },
            reviewResult: result,
            isGeneratingReview: false,
          });

          console.log('🎉 Interview review completed successfully');
        } catch (error) {
          console.error('❌ Failed to generate interview review:', error);
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to generate interview review',
            isGeneratingReview: false,
            currentSession: currentSession
              ? {
                  ...currentSession,
                  status: 'completed',
                }
              : null,
          });
        }
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
