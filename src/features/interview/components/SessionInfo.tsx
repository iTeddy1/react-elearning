import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface SessionInfoProps {
  startTime?: Date;
  answeredCount: number;
  totalQuestions: number;
  audioPermission: boolean;
}

export const SessionInfo: React.FC<SessionInfoProps> = ({
  startTime,
  answeredCount,
  totalQuestions,
  audioPermission,
}) => {
  if(!startTime) {
    return null;
  }
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              Started: {startTime.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>
              Answered: {answeredCount} / {totalQuestions}
            </span>
            {!audioPermission && (
              <Badge variant="destructive">
                Microphone Access Required
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};