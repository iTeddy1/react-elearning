import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  CheckCircle,
  Loader2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { formatTime } from '../utils/interview-helpers';

interface AudioPreviewCardProps {
  isPlayingPreview: boolean;
  previewCurrentTime: number;
  previewDuration: number;
  isProcessing: boolean;
  onPlayPreview: () => void;
  onRestartRecording: () => void;
  onSubmitAnswer: () => void;
}

export const AudioPreviewCard: React.FC<AudioPreviewCardProps> = ({
  isPlayingPreview,
  previewCurrentTime,
  previewDuration,
  isProcessing,
  onPlayPreview,
  onRestartRecording,
  onSubmitAnswer,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          Recording Complete
        </CardTitle>
        <CardDescription>Review your answer before submitting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Audio Preview Controls */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Button
            onClick={onPlayPreview}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {isPlayingPreview ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Play
              </>
            )}
          </Button>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Volume2 className="h-4 w-4" />
              <span>Audio Preview</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTime(previewCurrentTime)}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full transition-all duration-200"
                  style={{
                    width:
                      previewDuration > 0
                        ? `${(previewCurrentTime / previewDuration) * 100}%`
                        : '0%',
                  }}
                />
              </div>
              <span>{formatTime(previewDuration)}</span>
            </div>
          </div>

          <Button
            onClick={onRestartRecording}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Re-record
          </Button>
        </div>

        {/* Submit Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={onSubmitAnswer}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Submit Answer'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
