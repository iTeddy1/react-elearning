import { useState, useEffect, useCallback } from 'react';
import { AudioRecordingService } from '../utils/audio-recording';
import { resetAudioState } from '../utils/interview-helpers';

interface RecordingState {
  currentRecording: Blob | null;
  recordingDuration: number;
}

export const useInterviewRecording = (
  isRecording: boolean,
  audioService: AudioRecordingService
) => {
  const [state, setState] = useState<RecordingState>({
    currentRecording: null,
    recordingDuration: 0,
  });

  // Update recording duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRecording) {
      interval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          recordingDuration: audioService.getRecordingDuration(),
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, audioService]);

  const resetRecording = useCallback(() => {
    setState(resetAudioState());
  }, []);

  const setCurrentRecording = useCallback((blob: Blob | null) => {
    setState((prev) => ({ ...prev, currentRecording: blob }));
  }, []);

  const setRecordingDuration = useCallback((duration: number) => {
    setState((prev) => ({ ...prev, recordingDuration: duration }));
  }, []);

  return {
    ...state,
    resetRecording,
    setCurrentRecording,
    setRecordingDuration,
  };
};
