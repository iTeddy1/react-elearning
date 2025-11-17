import React, { useState, useEffect } from 'react';
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
import { AllAnswersPreview } from '../components/AllAnswersPreview';
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
  const [showAllAnswersPreview, setShowAllAnswersPreview] = useState(false);
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
        // Transform review to InterviewResult format for the UI
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
              response:
                feedback?.transcription || recording
                  ? 'Audio response recorded'
                  : 'No response',
              grammar: feedback?.detailedScores
                ? {
                    questionId: q.id,
                    sentenceStructure: feedback.detailedScores.clarity,
                    grammarRules: feedback.detailedScores.technicalAccuracy,
                    wordUsage: feedback.detailedScores.completeness,
                    incompleteSentencesAndFillers:
                      review.communicationMetrics?.fillerWords || 0,
                    score: feedback.detailedScores.clarity,
                    issues: feedback.weaknesses || [],
                    suggestions: feedback.improvementAreas || [],
                  }
                : null,
              contentRelevancy: {
                score:
                  feedback?.detailedScores?.relevance || feedback?.score || 0,
                improvement: feedback?.improvementAreas || review.weaknesses,
                reason: feedback?.feedback || 'No feedback available',
              },
            };
          }),
          scores: {
            grammarScore:
              review.scores?.communicationSkills || review.overallScore,
            communicationScore:
              review.scores?.communicationSkills || review.overallScore,
            totalRelevancyScore:
              review.scores?.technicalKnowledge || review.overallScore,
            overallInterviewScore: review.overallScore,
            professionalismScore:
              review.scores?.professionalism || review.overallScore,
            sociabilityScore: review.scores?.overallFit || review.overallScore,
            energyLevelScore: review.scores?.confidence || review.overallScore,
          },
          communicationBreakdown: review.communicationMetrics
            ? [
                {
                  metric: 'Clarity',
                  score: review.communicationMetrics.clarity,
                  feedback: 'Communication clarity assessment',
                },
                {
                  metric: 'Pace',
                  score: review.communicationMetrics.pace,
                  feedback: 'Speaking pace evaluation',
                },
                {
                  metric: 'Vocabulary',
                  score: review.communicationMetrics.vocabulary,
                  feedback: 'Vocabulary usage assessment',
                },
                {
                  metric: 'Grammar Accuracy',
                  score: review.communicationMetrics.grammarAccuracy,
                  feedback: 'Grammar and sentence structure',
                },
              ]
            : [],
          relevancyScoreBreakdown: currentSession.questions.map((q) => {
            const feedback = review.questionFeedback.find(
              (qf: { questionId: string }) => qf.questionId === q.id
            );
            return {
              questionId: q.id,
              question: q.question,
              answer: feedback?.transcription || 'Audio response',
              relevancyScore:
                feedback?.detailedScores?.relevance || feedback?.score || 0,
              relevancyType: q.category,
              reason: feedback?.feedback || 'No feedback available',
              improvements: feedback?.improvementAreas || review.weaknesses,
              extractedIdealAnswer: q.expectedTopics.join(', '),
              strengths: feedback?.strengths || review.strengths,
            };
          }),
          grammarScoreBreakdown: review.questionFeedback
            .filter((qf) => qf.detailedScores)
            .map((qf) => {
              const question = currentSession.questions.find(
                (q) => q.id === qf.questionId
              );
              return {
                questionId: qf.questionId,
                question: question?.question || '',
                sentenceStructure: qf.detailedScores!.clarity,
                grammarRules: qf.detailedScores!.technicalAccuracy,
                wordUsage: qf.detailedScores!.completeness,
                incompleteSentencesAndFillers:
                  review.communicationMetrics?.fillerWords || 0,
                suggestions: qf.improvementAreas || [],
              };
            }),
          overallSummary: {
            overallSummary: review.detailedFeedback,
            transcriptSummary:
              review.questionFeedback
                .filter((qf) => qf.transcription)
                .map(
                  (qf) =>
                    `Q: ${currentSession.questions.find((q) => q.id === qf.questionId)?.question}\nA: ${qf.transcription}`
                )
                .join('\n\n') || 'Interview completed with audio responses',
            strengths: review.strengths,
            weaknesses: review.weaknesses,
            keyInsights: review.recommendations,
            recommendation:
              review.hiringPotential || `Score: ${review.overallScore}%`,
            decision:
              review.redFlags && review.redFlags.length > 0
                ? 'Review with caution'
                : 'Positive evaluation',
          },
        };

        // Store enhanced review data in session for new UI components
        if (currentSession) {
          (currentSession as any).enhancedReview = review;
        }

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

  // Cleanup audio service on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up audio service on unmount');
      audioService.cleanup();
    };
  }, []);

  // Handle recording start
  const handleStartRecording = async () => {
    try {
      // Clean up any existing recording first (important for re-record)
      if (audioService.isRecording()) {
        console.log('⚠️ Stopping existing recording before starting new one');
        await audioService.stopRecording();
      }

      // Reset states
      recordingState.setRecordingDuration(0);
      recordingState.setCurrentRecording(null);
      audioPreviewState.resetPreview();

      // Start recording
      startRecording();
      await audioService.startRecording();

      console.log('✅ Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      setError(
        'Failed to start recording. Please check microphone permissions.'
      );
      toast.error('Failed to start recording. Please check your microphone.');
      stopRecording(); // Reset recording state if start failed
    }
  };

  // Handle recording stop
  const handleStopRecording = async () => {
    try {
      stopRecording();
      const audioBlob = await audioService.stopRecording();

      if (audioBlob && audioBlob.blob && audioBlob.duration > 0) {
        console.log('✅ Recording captured successfully:', {
          size: audioBlob.blob.size,
          duration: audioBlob.duration,
          type: audioBlob.blob.type,
        });
        recordingState.setCurrentRecording(audioBlob.blob);
        recordingState.setRecordingDuration(audioBlob.duration);

        // Force set the preview duration from the actual recording duration
        // This ensures we have the correct duration immediately
        setTimeout(() => {
          if (
            audioPreviewState.previewDuration === 0 ||
            audioPreviewState.previewDuration <= 1
          ) {
            console.log(
              '🔧 Forcing preview duration from recording:',
              audioBlob.duration
            );
            // The duration will be updated via the audio preview hook
          }
        }, 500);

        // Log the state after setting
        console.log(
          '📦 Recording state updated, blob available:',
          !!audioBlob.blob
        );
      } else {
        console.error('❌ Failed to capture recording:', audioBlob);
        setError('Failed to capture audio recording. Please try again.');
        toast.error('Recording failed. Please try again.');
      }
    } catch (error) {
      console.error('❌ Failed to stop recording:', error);
      setError('Failed to stop recording. Please try again.');
    }
  };

  // Handle restart recording
  const handleRestartRecording = async () => {
    try {
      console.log('🔄 Restarting recording...');

      // Stop any active recording first
      if (audioService.isRecording()) {
        await audioService.stopRecording();
      }

      // Clean up audio service completely
      audioService.cleanup();

      // Reset states
      audioPreviewState.resetPreview();
      recordingState.resetRecording();

      console.log('✅ Recording reset complete');
    } catch (error) {
      console.error('Error restarting recording:', error);
      // Continue with state reset even if cleanup fails
      audioPreviewState.resetPreview();
      recordingState.resetRecording();
    }
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

      toast.success('Answer submitted successfully!');
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setError('Failed to submit answer. Please try again.');
      toast.error('Failed to submit answer. Please try again.');
    }
  };

  // Handle back to home
  const handleBackToHome = () => {
    // Cleanup audio service before leaving
    audioService.cleanup();
    resetSession();
    void navigate('/');
  };

  // Handle navigation to setup
  const handleNavigateToSetup = () => {
    void navigate('/interview/setup');
  };

  // Handle navigation between questions with proper cleanup
  const handleNextQuestion = async () => {
    // Stop any active recording before navigating
    if (isRecording) {
      console.log('⚠️ Stopping active recording before navigation');
      await handleStopRecording();
    }

    // Clean up current recording state but keep saved recordings
    if (!hasCurrentRecording) {
      recordingState.resetRecording();
      audioPreviewState.resetPreview();
    }

    nextQuestion();
  };

  const handlePreviousQuestion = async () => {
    // Stop any active recording before navigating
    if (isRecording) {
      console.log('⚠️ Stopping active recording before navigation');
      await handleStopRecording();
    }

    // Clean up current recording state but keep saved recordings
    if (!hasCurrentRecording) {
      recordingState.resetRecording();
      audioPreviewState.resetPreview();
    }

    previousQuestion();
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

  // Handle complete interview - show preview first
  const handleCompleteInterview = () => {
    if (!currentSession) {
      setError('No active interview session');
      return;
    }

    // Show preview modal instead of completing immediately
    setShowAllAnswersPreview(true);
  };

  // Handle final submission after preview
  const handleFinalSubmit = async () => {
    if (!currentSession) {
      setError('No active interview session');
      return;
    }

    // Close the preview
    setShowAllAnswersPreview(false);

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
          communicationBreakdown: [],
          relevancyScoreBreakdown: currentSession.questions.map((q) => ({
            questionId: q.id,
            question: q.question,
            answer: 'Audio response',
            relevancyScore: mockReview.overallScore,
            relevancyType: q.category,
            reason: 'Mock feedback for testing',
            improvements: mockReview.overallFeedback.weaknesses,
            extractedIdealAnswer: q.expectedTopics.join(', '),
            strengths: mockReview.overallFeedback.strengths,
          })),
          grammarScoreBreakdown: [],
          overallSummary: {
            overallSummary: mockReview.overallFeedback.summary,
            transcriptSummary: 'Mock interview completed successfully',
            strengths: mockReview.overallFeedback.strengths,
            weaknesses: mockReview.overallFeedback.weaknesses,
            keyInsights: mockReview.overallFeedback.recommendations,
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
        <InterviewResults />
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
        {/* All Answers Preview Modal */}
        {showAllAnswersPreview && currentSession && (
          <AllAnswersPreview
            questions={currentSession.questions}
            recordings={currentSession.recordings}
            onClose={() => setShowAllAnswersPreview(false)}
            onSubmit={() => void handleFinalSubmit()}
          />
        )}

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
            onRestartRecording={() => void handleRestartRecording()}
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
          onPreviousQuestion={() => void handlePreviousQuestion()}
          onNextQuestion={() => void handleNextQuestion()}
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
