import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useInterviewSessionStore } from '../store/interview-session-store';
import { useGenerateInterviewReviewMutation } from '../hooks/use-interview-queries';
import { QuestionCard } from '../components/QuestionCard';
import { InterviewResults } from './InterviewResults';
import { InterviewHeader } from '../components/InterviewHeader';
import { AudioPreviewCard } from '../components/AudioPreviewCard';
import { InterviewNavigation } from '../components/InterviewNavigation';
import { SessionInfo } from '../components/SessionInfo';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { NoActiveInterview } from '../components/NoActiveInterview';
import { AudioRecordingService } from '../utils/audio-recording';
import { useAudioPreview } from '../hooks/useAudioPreview';
import { useInterviewRecording } from '../hooks/useInterviewRecording';
import {
  areAllQuestionsAnswered,
  hasQuestionRecording,
} from '../utils/interview-helpers';
import {
  getMockInterviewReview,
  simulateDelay,
} from '../mocks/interview-mock-data';

const audioService = new AudioRecordingService();

export const InterviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSession,
    isRecording,
    isProcessing,
    error,
    audioPermission,
    reviewResult,
    isGeneratingReview,
    nextQuestion,
    previousQuestion,
    startRecording,
    stopRecording,
    submitAnswer,
    addRecording,
    completeInterview,
    setReviewResult,
    setGeneratingReview,
    resetSession,
    setError,
  } = useInterviewSessionStore();

  const generateReviewMutation = useGenerateInterviewReviewMutation({
    onSuccess: (review) => {
      if (currentSession) {
        // Transform review to legacy InterviewResult format for the UI
        const result = {
          questions: currentSession.questions.map((q) => {
            const feedback = review.questionFeedback.find(
              (qf: { questionId: string }) => qf.questionId === q.id
            );
            const recording = currentSession.recordings.find(
              (r) => r.questionId === q.id
            );
            return {
              questionId: q.id,
              question: q.question,
              response: recording ? 'Audio response recorded' : 'No response',
              grammar: null,
              contentRelevancy: {
                score: feedback?.score || 0,
                improvement: review.weaknesses,
                reason: feedback?.feedback || 'No feedback available',
              },
            };
          }),
          scores: {
            grammarScore: review.overallScore,
            communicationScore: review.overallScore,
            totalRelevancyScore: review.overallScore,
            overallInterviewScore: review.overallScore,
            professionalismScore: review.overallScore,
            sociabilityScore: review.overallScore,
            energyLevelScore: review.overallScore,
          },
          communication_breakdown: [],
          relevancy_score_breakdown: currentSession.questions.map((q) => {
            const feedback = review.questionFeedback.find(
              (qf: { questionId: string }) => qf.questionId === q.id
            );
            return {
              questionId: q.id,
              question: q.question,
              answer: 'Audio response',
              relevancy_score: feedback?.score || 0,
              relevancy_type: q.category,
              reason: feedback?.feedback || 'No feedback available',
              improvements: review.weaknesses,
              extracted_ideal_answer: q.expectedTopics.join(', '),
              strengths: review.strengths,
            };
          }),
          grammar_score_breakdown: [],
          overallSummary: {
            overall_summary: review.detailedFeedback,
            transcript_summary: 'Interview completed with audio responses',
            strengths: review.strengths,
            weaknesses: review.weaknesses,
            key_insights: review.recommendations,
            recommendation: `Score: ${review.overallScore}%`,
          },
        };

        setReviewResult(result);
        toast.success('Interview review generated successfully!');
      }
    },
    onError: (error) => {
      console.error('Failed to generate interview review:', error);
      setError('Failed to generate interview review. Please try again.');
      toast.error('Failed to generate interview review');
    },
  });

  // Use custom hooks for state management
  const recordingState = useInterviewRecording(isRecording, audioService);
  const audioPreviewState = useAudioPreview(recordingState.currentRecording);

  // Handle recording start
  const handleStartRecording = async () => {
    try {
      startRecording();
      await audioService.startRecording();

      recordingState.setRecordingDuration(0);
      recordingState.setCurrentRecording(null);
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError(
        'Failed to start recording. Please check microphone permissions.'
      );
      stopRecording(); // Reset recording state if start failed
    }
  };

  // Handle recording stop
  const handleStopRecording = async () => {
    try {
      stopRecording();
      const audioBlob = await audioService.stopRecording();

      if (audioBlob && audioBlob.duration > 0) {
        console.log('✅ Recording captured successfully:', {
          size: audioBlob.blob.size,
          duration: audioBlob.duration,
          type: audioBlob.blob.type,
        });
        recordingState.setCurrentRecording(audioBlob.blob);
        recordingState.setRecordingDuration(audioBlob.duration);

        // Log the state after setting
        console.log(
          '📦 Recording state updated, blob available:',
          !!audioBlob.blob
        );
      } else {
        console.error('❌ Failed to capture recording:', audioBlob);
        setError('Failed to capture audio recording. Please try again.');
      }
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      setError('Failed to stop recording. Please try again.');
    }
  };

  // Handle restart recording
  const handleRestartRecording = () => {
    audioPreviewState.resetPreview();
    recordingState.resetRecording();
  };

  // Handle answer submission
  const handleSubmitAnswer = () => {
    if (!currentSession || !recordingState.currentRecording) return;

    const currentQuestion =
      currentSession.questions[currentSession.currentQuestionIndex];

    try {
      // Create audio recording entry
      const audioRecording = {
        id: `recording-${currentQuestion.id}-${Date.now()}`,
        questionId: currentQuestion.id,
        audioBlob: recordingState.currentRecording,
        duration: recordingState.recordingDuration,
        timestamp: new Date(),
      };

      // Add the audio recording to the session
      addRecording(audioRecording);

      // Also submit a text answer reference for compatibility
      submitAnswer(
        currentQuestion.id,
        `Audio recording (${recordingState.recordingDuration}s)`
      );

      // Clean up preview and recording states
      audioPreviewState.resetPreview();
      recordingState.resetRecording();
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setError('Failed to submit answer. Please try again.');
    }
  };

  // Handle restart
  const handleRestart = () => {
    resetSession();
    void navigate('/interview/setup');
  };

  // Handle back to home
  const handleBackToHome = () => {
    resetSession();
    void navigate('/');
  };

  // Handle navigation to setup
  const handleNavigateToSetup = () => {
    void navigate('/interview/setup');
  };

  // Get current question
  const currentQuestion =
    currentSession?.questions[currentSession.currentQuestionIndex];

  // Check if current question has recording
  const hasCurrentRecording =
    currentSession && currentQuestion
      ? hasQuestionRecording(currentQuestion.id, currentSession.recordings)
      : false;

  // Check if all questions are answered to show completion state
  const allQuestionsAnswered = currentSession
    ? areAllQuestionsAnswered(
        currentSession.questions,
        currentSession.recordings
      )
    : false;

  // Handle complete interview
  const handleCompleteInterview = async () => {
    if (!currentSession || !allQuestionsAnswered) {
      setError('Please answer all questions before completing the interview');
      return;
    }

    try {
      completeInterview();
      setGeneratingReview(true);

      // Check if we're in test mode
      if (currentSession.testMode) {
        console.log('🧪 Test Mode: Using mock review');
        toast.info('Test Mode: Generating mock review (no AI calls)');

        // Simulate AI delay
        await simulateDelay(2000);

        // Get mock review
        const mockReview = getMockInterviewReview(
          currentSession.jobRole,
          currentSession.difficulty,
          'good'
        );

        // Transform mock review to InterviewResult format
        const result = {
          questions: currentSession.questions.map((q) => {
            const recording = currentSession.recordings.find(
              (r) => r.questionId === q.id
            );
            return {
              questionId: q.id,
              question: q.question,
              response: recording ? 'Audio response recorded' : 'No response',
              grammar: null,
              contentRelevancy: {
                score: mockReview.overallScore,
                improvement: mockReview.overallFeedback.weaknesses,
                reason: 'Mock feedback for testing',
              },
            };
          }),
          scores: {
            grammarScore: mockReview.overallScore,
            communicationScore: mockReview.scores.communication,
            totalRelevancyScore: mockReview.overallScore,
            overallInterviewScore: mockReview.overallScore,
            professionalismScore: mockReview.scores.professionalism,
            sociabilityScore: mockReview.scores.communication,
            energyLevelScore: mockReview.scores.confidence,
          },
          communication_breakdown: [],
          relevancy_score_breakdown: currentSession.questions.map((q) => ({
            questionId: q.id,
            question: q.question,
            answer: 'Audio response',
            relevancy_score: mockReview.overallScore,
            relevancy_type: q.category,
            reason: 'Mock feedback for testing',
            improvements: mockReview.overallFeedback.weaknesses,
            extracted_ideal_answer: q.expectedTopics.join(', '),
            strengths: mockReview.overallFeedback.strengths,
          })),
          grammar_score_breakdown: [],
          overallSummary: {
            overall_summary: mockReview.overallFeedback.summary,
            transcript_summary: 'Mock interview completed successfully',
            strengths: mockReview.overallFeedback.strengths,
            weaknesses: mockReview.overallFeedback.weaknesses,
            key_insights: mockReview.overallFeedback.recommendations,
            recommendation: `Score: ${mockReview.overallScore}%`,
          },
        };

        setReviewResult(result);
        toast.success('Mock review generated successfully!');
        return;
      }

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
        };
      });

      // Call React Query mutation to generate review via AI service
      await generateReviewMutation.mutateAsync({
        questions: currentSession.questions,
        answers,
        role: currentSession.jobRole,
        language: 'en',
        sessionId: currentSession.id,
      });
    } catch (error) {
      console.error('Failed to complete interview:', error);
      setError('Failed to complete interview. Please try again.');
    } finally {
      setGeneratingReview(false);
    }
  };

  // Show results if review is generated
  if (currentSession && reviewResult) {
    return (
      <div className="container mx-auto py-8 px-4">
        <InterviewResults />
      </div>
    );
  }

  // Show results if all questions are answered (fallback)
  if (
    currentSession &&
    allQuestionsAnswered &&
    currentSession.status === 'completed' &&
    !isGeneratingReview
  ) {
    return (
      <div className="container mx-auto py-8 px-4">
        <InterviewResults
          result={{
            questions: [],
            scores: {
              grammarScore: 0,
              communicationScore: 0,
              totalRelevancyScore: 0,
              overallInterviewScore: 0,
              professionalismScore: 0,
              sociabilityScore: 0,
              energyLevelScore: 0,
            },
            communication_breakdown: [],
            relevancy_score_breakdown: [],
            grammar_score_breakdown: [],
            overallSummary: {
              overall_summary: 'Interview completed successfully',
              transcript_summary: 'All questions were answered',
              strengths: ['Completed all questions'],
              weaknesses: ['Analysis pending'],
              key_insights: ['Interview process completed'],
              recommendation: 'Review your responses',
            },
          }}
          onRestart={handleRestart}
          onBackToHome={handleBackToHome}
        />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <ErrorState
        error={error}
        onTryAgain={() => setError(null)}
        onBackToHome={handleBackToHome}
      />
    );
  }

  // Show loading state
  if (isProcessing || isGeneratingReview) {
    const message = isGeneratingReview
      ? 'Analyzing your interview responses with AI... This may take a few moments.'
      : currentSession?.status === 'completed'
        ? 'Analyzing your responses...'
        : 'Processing...';

    return <LoadingState message={message} />;
  }

  // Show interview not started state
  if (!currentSession) {
    return <NoActiveInterview onStartInterview={handleNavigateToSetup} />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Progress */}
        <InterviewHeader
          currentQuestionIndex={currentSession.currentQuestionIndex}
          totalQuestions={currentSession.questions.length}
        />

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            questionNumber={currentSession.currentQuestionIndex + 1}
            totalQuestions={currentSession.questions.length}
            question={currentQuestion.text}
            category={currentQuestion.category}
            difficulty={currentQuestion.difficulty}
            isRecording={isRecording}
            hasRecording={
              hasCurrentRecording || !!recordingState.currentRecording
            }
            recordingDuration={recordingState.recordingDuration}
            onStartRecording={() => void handleStartRecording()}
            onStopRecording={() => void handleStopRecording()}
          />
        )}

        {/* Audio Preview and Answer Controls */}
        {recordingState.currentRecording && !isRecording && (
          <AudioPreviewCard
            isPlayingPreview={audioPreviewState.isPlayingPreview}
            previewCurrentTime={audioPreviewState.previewCurrentTime}
            previewDuration={audioPreviewState.previewDuration}
            isProcessing={isProcessing}
            onPlayPreview={audioPreviewState.handlePlayPreview}
            onRestartRecording={handleRestartRecording}
            onSubmitAnswer={() => void handleSubmitAnswer()}
          />
        )}

        {/* Navigation Controls */}
        <InterviewNavigation
          currentQuestionIndex={currentSession.currentQuestionIndex}
          totalQuestions={currentSession.questions.length}
          questions={currentSession.questions}
          recordings={currentSession.recordings}
          allQuestionsAnswered={allQuestionsAnswered}
          isProcessing={isProcessing || isGeneratingReview}
          onPreviousQuestion={previousQuestion}
          onNextQuestion={nextQuestion}
          onCompleteInterview={() => void handleCompleteInterview()}
        />

        {/* Session Info */}
        <SessionInfo
          startTime={currentSession.startTime}
          answeredCount={currentSession.recordings.length}
          totalQuestions={currentSession.questions.length}
          audioPermission={audioPermission}
        />
      </div>
    </div>
  );
};
