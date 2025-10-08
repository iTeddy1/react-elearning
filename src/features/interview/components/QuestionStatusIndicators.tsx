import React from 'react';
import { getQuestionStatus, getStatusColorClass } from '../utils/interview-helpers';

interface QuestionStatusIndicatorsProps {
  questions: Array<{ id: string }>;
  recordings: Array<{ questionId: string }>;
  currentQuestionIndex: number;
}

export const QuestionStatusIndicators: React.FC<QuestionStatusIndicatorsProps> = ({
  questions,
  recordings,
  currentQuestionIndex,
}) => {
  return (
    <div className="flex gap-1">
      {questions.map((question, index) => {
        const status = getQuestionStatus(question.id, index, currentQuestionIndex, recordings);
        const colorClass = getStatusColorClass(status);
        
        return (
          <div
            key={question.id}
            className={`w-3 h-3 rounded-full ${colorClass}`}
            title={`Question ${index + 1}: ${status}`}
          />
        );
      })}
    </div>
  );
};