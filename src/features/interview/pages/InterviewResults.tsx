import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ResultsHeader from '../components/review-result/ResultsHeader';
import OverallScore from '../components/review-result/OverallScore';
import { ScoresBreakdown } from '../components/results/ScoresBreakdown';
import { CommunicationMetrics } from '../components/results/CommunicationMetrics';
import { CriticalFeedback } from '../components/results/CriticalFeedback';
import { QuestionTranscripts } from '../components/results/QuestionTranscripts';
import OverallSummary from '../components/review-result/OverallSummary';
import { useInterviewSessionStore } from '../store/interview-session-store';

export const InterviewResults: React.FC = () => {
  const navigate = useNavigate();
  const { resetSession, reviewResult, currentSession } =
    useInterviewSessionStore();

  if (!reviewResult || !currentSession) {
    return null;
  }

  const { scores, overallSummary } = reviewResult;

  // Get enhanced review data from session store
  const enhancedReview = (currentSession as any).enhancedReview;

  const handleRestart = () => {
    resetSession();
    void navigate('/interview/setup');
  };

  // Handle back to home
  const handleBackToHome = () => {
    resetSession();
    void navigate('/');
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <ResultsHeader />

      {/* Overall Scores - Always show basic scores */}
      <OverallScore scores={scores} />

      {/* Enhanced Scores Breakdown - Show if available */}
      {enhancedReview?.scores && (
        <ScoresBreakdown scores={enhancedReview.scores} />
      )}

      {/* Communication Metrics - Show if available */}
      {enhancedReview?.communicationMetrics && (
        <CommunicationMetrics metrics={enhancedReview.communicationMetrics} />
      )}

      {/* Critical Feedback - Show if available */}
      {(enhancedReview?.hiringPotential ||
        enhancedReview?.redFlags?.length > 0 ||
        enhancedReview?.standoutMoments?.length > 0 ||
        enhancedReview?.criticalConcerns?.length > 0) && (
        <CriticalFeedback
          hiringPotential={enhancedReview.hiringPotential}
          redFlags={enhancedReview.redFlags}
          standoutMoments={enhancedReview.standoutMoments}
          criticalConcerns={enhancedReview.criticalConcerns}
        />
      )}

      {/* Question Transcripts with Detailed Analysis - Show if available */}
      {enhancedReview?.questionFeedback?.some(
        (qf: any) => qf.transcription
      ) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Detailed Question Analysis</h2>
          <QuestionTranscripts
            questionFeedback={enhancedReview.questionFeedback}
            questions={currentSession.questions}
          />
        </div>
      )}

      {/* Overall Summary */}
      <OverallSummary overall={overallSummary} />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center pt-6">
        <Button onClick={handleRestart} size="lg">
          Take Another Interview
        </Button>
        <Button onClick={handleBackToHome} variant="outline" size="lg">
          Back to Home
        </Button>
      </div>
    </div>
  );
};
