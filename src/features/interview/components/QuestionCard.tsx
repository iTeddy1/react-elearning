import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Play, Square, Clock, CheckCircle } from 'lucide-react';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isRecording: boolean;
  hasRecording: boolean;
  recordingDuration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onPlayRecording?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber,
  totalQuestions,
  question,
  category,
  difficulty,
  isRecording,
  hasRecording,
  recordingDuration,
  onStartRecording,
  onStopRecording,
  onPlayRecording,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Question {questionNumber} of {totalQuestions}
          </CardTitle>
          <div className="flex gap-2">
            {category && (
              <Badge variant="outline" className="capitalize">
                {category}
              </Badge>
            )}
            {difficulty && (
              <Badge className={getDifficultyColor(difficulty)}>
                {difficulty}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <CardDescription className="text-lg font-medium text-foreground">
          {question}
        </CardDescription>

        {/* Recording Controls */}
        <div className="flex flex-col items-center space-y-4">
          {/* Recording Duration Display */}
          {(isRecording || hasRecording) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(recordingDuration)}</span>
              {hasRecording && !isRecording && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>
          )}

          {/* Recording Button */}
          <div className="flex gap-4">
            {!isRecording ? (
              <Button
                onClick={onStartRecording}
                size="lg"
                className="flex items-center gap-2"
                variant={hasRecording ? 'outline' : 'default'}
              >
                <Mic className="h-5 w-5" />
                {hasRecording ? 'Re-record Answer' : 'Start Recording'}
              </Button>
            ) : (
              <Button
                onClick={onStopRecording}
                size="lg"
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="h-5 w-5" />
                Stop Recording
              </Button>
            )}

            {/* Play Recording Button */}
            {hasRecording && !isRecording && onPlayRecording && (
              <Button
                onClick={onPlayRecording}
                size="lg"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                Play Recording
              </Button>
            )}
          </div>

          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Recording...</span>
            </div>
          )}
        </div>

        {/* Recording Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Recording Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Find a quiet environment to minimize background noise</li>
            <li>• Take your time to think before answering</li>
            <li>• You can re-record your answer if needed</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
