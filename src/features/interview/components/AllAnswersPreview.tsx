import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  Volume2,
} from 'lucide-react';
import { formatTime } from '../utils/interview-helpers';
import { InterviewQuestion, AudioRecording } from '../types';

interface AllAnswersPreviewProps {
  questions: InterviewQuestion[];
  recordings: AudioRecording[];
  onClose: () => void;
  onSubmit: () => void;
}

export const AllAnswersPreview: React.FC<AllAnswersPreviewProps> = ({
  questions,
  recordings,
  onClose,
  onSubmit,
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<
    Map<string, HTMLAudioElement>
  >(new Map());
  const [durations, setDurations] = useState<Map<string, number>>(new Map());
  const [currentTimes, setCurrentTimes] = useState<Map<string, number>>(
    new Map()
  );

  // Create audio elements for all recordings
  useEffect(() => {
    const newAudioElements = new Map<string, HTMLAudioElement>();
    const newDurations = new Map<string, number>();

    recordings.forEach((recording) => {
      const url = URL.createObjectURL(recording.audioBlob);
      const audio = new Audio(url);

      audio.addEventListener('loadedmetadata', () => {
        if (
          audio.duration &&
          !isNaN(audio.duration) &&
          isFinite(audio.duration)
        ) {
          setDurations((prev) =>
            new Map(prev).set(recording.id, audio.duration)
          );
        }
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTimes((prev) =>
          new Map(prev).set(recording.id, audio.currentTime)
        );
      });

      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setCurrentTimes((prev) => new Map(prev).set(recording.id, 0));
      });

      audio.preload = 'metadata';
      audio.load();

      newAudioElements.set(recording.id, audio);
      newDurations.set(recording.id, recording.duration);
    });

    setAudioElements(newAudioElements);
    setDurations(newDurations);

    // Cleanup on unmount
    return () => {
      newAudioElements.forEach((audio) => {
        audio.pause();
        URL.revokeObjectURL(audio.src);
      });
    };
  }, [recordings]);

  const handlePlayPause = (recordingId: string) => {
    const audio = audioElements.get(recordingId);
    if (!audio) return;

    if (playingId === recordingId) {
      audio.pause();
      setPlayingId(null);
    } else {
      // Pause any currently playing audio
      if (playingId) {
        const currentAudio = audioElements.get(playingId);
        currentAudio?.pause();
      }

      void audio.play();
      setPlayingId(recordingId);
    }
  };

  const totalDuration = Array.from(durations.values()).reduce(
    (sum, duration) => sum + duration,
    0
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Review All Answers
          </CardTitle>
          <CardDescription>
            Review all your recorded answers before submitting the interview
          </CardDescription>
          <div className="flex items-center gap-4 pt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Total Duration: {formatTime(totalDuration)}
            </Badge>
            <Badge variant="secondary">
              {recordings.length} / {questions.length} Questions Answered
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-[50vh]">
            <div className="space-y-4 pr-4">
              {questions.map((question, index) => {
                const recording = recordings.find(
                  (r) => r.questionId === question.id
                );
                const isPlaying = playingId === recording?.id;
                const duration = recording
                  ? durations.get(recording.id) || recording.duration
                  : 0;
                const currentTime = recording
                  ? currentTimes.get(recording.id) || 0
                  : 0;

                return (
                  <Card
                    key={question.id}
                    className={`transition-all ${
                      recording
                        ? 'border-green-200 bg-green-50/30'
                        : 'border-orange-200 bg-orange-50/30'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Question Number Badge */}
                        <div
                          className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            recording
                              ? 'bg-green-500 text-white'
                              : 'bg-orange-400 text-white'
                          }`}
                        >
                          {index + 1}
                        </div>

                        {/* Question and Answer Info */}
                        <div className="flex-1 space-y-3">
                          {/* Question Text */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {question.category}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {question.difficulty}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-900">
                              {question.question}
                            </p>
                          </div>

                          {/* Audio Player or Warning */}
                          {recording ? (
                            <div className="bg-white rounded-lg p-3 border">
                              <div className="flex items-center gap-3">
                                <Button
                                  onClick={() => handlePlayPause(recording.id)}
                                  variant="outline"
                                  size="sm"
                                  className="flex-shrink-0"
                                >
                                  {isPlaying ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>

                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Volume2 className="h-3 w-3" />
                                    <span>Audio Response</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">
                                      {formatTime(currentTime)}
                                    </span>
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="bg-blue-500 h-1.5 rounded-full transition-all"
                                        style={{
                                          width:
                                            duration > 0
                                              ? `${(currentTime / duration) * 100}%`
                                              : '0%',
                                        }}
                                      />
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {formatTime(duration)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                              <div className="flex items-center gap-2 text-orange-700">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">
                                  No answer recorded
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t mt-4">
            <Button variant="outline" onClick={onClose}>
              Go Back
            </Button>

            <div className="flex items-center gap-2">
              {recordings.length < questions.length && (
                <div className="text-sm text-orange-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {questions.length - recordings.length} question(s)
                    unanswered
                  </span>
                </div>
              )}
              <Button
                onClick={onSubmit}
                disabled={recordings.length === 0}
                className="min-w-[200px]"
              >
                {recordings.length === questions.length
                  ? 'Submit Interview'
                  : 'Submit Anyway'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
