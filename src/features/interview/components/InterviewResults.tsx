import React from 'react';
import { Button } from '@/components/ui/button';
import { InterviewResult } from '../types';
import QuestionAnalysis from './review-result/QuestionAnalysis';
import CommunicationAnalysis from './review-result/CommunicationAnalysis';
import OverallScore from './review-result/OverallScore';
import ResultsHeader from './review-result/ResultsHeader';
import OverallSummary from './review-result/OverallSummary';

interface InterviewResultsProps {
  result: InterviewResult;
  onRestart: () => void;
  onBackToHome: () => void;
}

export const InterviewResults: React.FC<InterviewResultsProps> = ({
  result,
  onRestart,
  onBackToHome,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <ResultsHeader />

      {/* Overall Scores */}
      <OverallScore scores={result.scores} />

      {/* Communication Breakdown */}
      <CommunicationAnalysis
        communicationBreakdown={result.communication_breakdown}
      />

      {/* Question-by-Question Analysis */}
      <QuestionAnalysis
        relevancyScoreBreakdown={result.relevancy_score_breakdown}
      />

      {/* Overall Summary */}
      <OverallSummary overall={result.overallSummary} />

      {/* Action Buttons */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onRestart} size="lg">
          Take Another Interview
        </Button>
        <Button onClick={onBackToHome} variant="outline" size="lg">
          Back to Home
        </Button>
      </div>
    </div>
  );
};
