import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { QuestionStatusIndicators } from './QuestionStatusIndicators';
import { hasQuestionRecording } from '../utils/interview-helpers';

interface InterviewNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  questions: Array<{ id: string }>;
  recordings: Array<{ questionId: string }>;
  allQuestionsAnswered: boolean;
  isProcessing: boolean;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onCompleteInterview: () => void;
}

export const InterviewNavigation: React.FC<InterviewNavigationProps> = ({
  currentQuestionIndex,
  totalQuestions,
  questions,
  recordings,
  allQuestionsAnswered,
  isProcessing,
  onPreviousQuestion,
  onNextQuestion,
  onCompleteInterview,
}) => {
  // Check if current question is answered
  const currentQuestion = questions[currentQuestionIndex];
  const currentQuestionAnswered = currentQuestion
    ? hasQuestionRecording(currentQuestion.id, recordings)
    : false;

  // Can navigate next if: not at last question OR (at last question but not answered - allows going back)
  const canNavigateNext = currentQuestionIndex < totalQuestions - 1;

  // Can navigate previous if: not at first question
  const canNavigatePrevious = currentQuestionIndex > 0;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={onPreviousQuestion}
            disabled={!canNavigatePrevious}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center flex-col gap-4">
            {/* Question Status Indicators */}
            <QuestionStatusIndicators
              questions={questions}
              recordings={recordings}
              currentQuestionIndex={currentQuestionIndex}
            />

            {/* Complete Interview Button - show when all answered */}
            {allQuestionsAnswered && (
              <Button
                onClick={() => void onCompleteInterview()}
                disabled={isProcessing}
                className="flex items-center gap-2"
                variant="default"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Complete Interview'
                )}
              </Button>
            )}

            {/* Hint when not all questions answered */}
            {!allQuestionsAnswered && (
              <div className="text-sm text-muted-foreground text-center">
                {currentQuestionAnswered ? (
                  <span className="text-green-600">✓ Question answered</span>
                ) : (
                  <span className="text-orange-600">
                    ⚠ Answer this question to continue
                  </span>
                )}
              </div>
            )}
          </div>

          <Button
            onClick={onNextQuestion}
            disabled={!canNavigateNext}
            variant="outline"
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
