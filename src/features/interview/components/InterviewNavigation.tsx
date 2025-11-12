import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { QuestionStatusIndicators } from './QuestionStatusIndicators';

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
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={onPreviousQuestion}
            disabled={currentQuestionIndex === 0}
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

            {/* Complete Interview Button */}
            {allQuestionsAnswered && (
              <Button
                onClick={() => void onCompleteInterview()}
                disabled={isProcessing}
                className="flex items-center gap-2"
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
          </div>

          <Button
            onClick={onNextQuestion}
            disabled={currentQuestionIndex === totalQuestions - 1}
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
