import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InterviewResult } from '../types';
import QuestionAnalysis from '../components/review-result/QuestionAnalysis';
import CommunicationAnalysis from '../components/review-result/CommunicationAnalysis';
import OverallScore from '../components/review-result/OverallScore';
import ResultsHeader from '../components/review-result/ResultsHeader';
import OverallSummary from '../components/review-result/OverallSummary';
import { useInterviewSessionStore } from '../store/interview-session-store';

export const InterviewResults: React.FC = () => {
  const navigate = useNavigate();
  const { resetSession, reviewResult } = useInterviewSessionStore();
  const {
    scores,
    communication_breakdown,
    relevancy_score_breakdown,
    overallSummary,
  } = reviewResult;
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
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <ResultsHeader />

      {/* Overall Scores */}
      <OverallScore scores={scores} />

      {/* Communication Breakdown */}
      <CommunicationAnalysis communicationBreakdown={communication_breakdown} />

      {/* Question-by-Question Analysis */}
      <QuestionAnalysis relevancyScoreBreakdown={relevancy_score_breakdown} />

      {/* Overall Summary */}
      <OverallSummary overall={overallSummary} />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
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
