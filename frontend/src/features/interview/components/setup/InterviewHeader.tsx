import React from 'react';

interface InterviewHeaderProps {
  className?: string;
}

export const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  className,
}) => {
  return (
    <div className={`text-center space-y-4 ${className || ''}`}>
      <h1 className="text-3xl font-bold">AI Interview Practice</h1>
      <p className="text-muted-foreground">
        Practice your interview skills with our AI-powered interview simulator.
        Get real-time feedback on your communication, grammar, and content
        relevancy.
      </p>
    </div>
  );
};
