import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing...',
}) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-md mx-auto">
        <CardContent className="flex flex-col items-center space-y-4 py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground text-center">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
};
