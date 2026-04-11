import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { calculateProgress } from '../utils/interview-helpers';

interface InterviewHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  currentQuestionIndex,
  totalQuestions,
}) => {
  const progress = calculateProgress(currentQuestionIndex, totalQuestions);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI Interview Session</CardTitle>
          <Badge variant="outline">
            {currentQuestionIndex + 1} of {totalQuestions}
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>
    </Card>
  );
};
