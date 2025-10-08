import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NoActiveInterviewProps {
  onStartInterview: () => void;
}

export const NoActiveInterview: React.FC<NoActiveInterviewProps> = ({
  onStartInterview,
}) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>No Active Interview</CardTitle>
          <CardDescription>
            Please start an interview from the setup page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onStartInterview} className="w-full">
            Start Interview
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};