import { useState, useEffect, useCallback } from 'react';
import {
  createAudioPreview,
  cleanupAudioPreview,
} from '../utils/interview-helpers';

interface AudioPreviewState {
  audioPreview: { url: string; audio: HTMLAudioElement } | null;
  isPlayingPreview: boolean;
  previewCurrentTime: number;
  previewDuration: number;
}

export const useAudioPreview = (currentRecording: Blob | null) => {
  const [state, setState] = useState<AudioPreviewState>({
    audioPreview: null,
    isPlayingPreview: false,
    previewCurrentTime: 0,
    previewDuration: 0,
  });

  // Create audio preview when recording is available
  useEffect(() => {
    if (currentRecording && !state.audioPreview) {
      const audioPreview = createAudioPreview(
        currentRecording,
        (duration) =>
          setState((prev) => ({ ...prev, previewDuration: duration })),
        (currentTime) =>
          setState((prev) => ({ ...prev, previewCurrentTime: currentTime })),
        () =>
          setState((prev) => ({
            ...prev,
            isPlayingPreview: false,
            previewCurrentTime: 0,
          }))
      );

      setState((prev) => ({ ...prev, audioPreview }));
    }
  }, [currentRecording, state.audioPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudioPreview(state.audioPreview);
    };
  }, [state.audioPreview]);

  const handlePlayPreview = useCallback(() => {
    if (!state.audioPreview) return;

    if (state.isPlayingPreview) {
      state.audioPreview.audio.pause();
      setState((prev) => ({ ...prev, isPlayingPreview: false }));
    } else {
      void state.audioPreview.audio.play();
      setState((prev) => ({ ...prev, isPlayingPreview: true }));
    }
  }, [state.audioPreview, state.isPlayingPreview]);

  const resetPreview = useCallback(() => {
    cleanupAudioPreview(state.audioPreview);
    setState({
      audioPreview: null,
      isPlayingPreview: false,
      previewCurrentTime: 0,
      previewDuration: 0,
    });
  }, [state.audioPreview]);

  return {
    ...state,
    handlePlayPreview,
    resetPreview,
  };
};
