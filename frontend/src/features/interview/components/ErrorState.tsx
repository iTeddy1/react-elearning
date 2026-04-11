import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onTryAgain: () => void;
  onBackToHome: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onTryAgain,
  onBackToHome,
}) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-2">
            <Button onClick={onTryAgain} variant="outline">
              Try Again
            </Button>
            <Button onClick={onBackToHome}>Back to Home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
