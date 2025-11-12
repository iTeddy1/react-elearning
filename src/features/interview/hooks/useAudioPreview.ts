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
    // Cleanup previous preview if exists
    if (state.audioPreview) {
      console.log('🧹 Cleaning up previous audio preview');
      cleanupAudioPreview(state.audioPreview);
    }

    if (currentRecording) {
      console.log('🎵 Creating audio preview for recording:', {
        size: currentRecording.size,
        type: currentRecording.type,
      });

      const audioPreview = createAudioPreview(
        currentRecording,
        (duration) => {
          console.log('📊 Audio duration loaded:', duration);
          setState((prev) => ({ ...prev, previewDuration: duration }));
        },
        (currentTime) =>
          setState((prev) => ({ ...prev, previewCurrentTime: currentTime })),
        () =>
          setState((prev) => ({
            ...prev,
            isPlayingPreview: false,
            previewCurrentTime: 0,
          }))
      );

      setState((prev) => ({ 
        ...prev, 
        audioPreview,
        // Reset playback state
        isPlayingPreview: false,
        previewCurrentTime: 0,
      }));
    } else {
      // Reset state when no recording
      setState({
        audioPreview: null,
        isPlayingPreview: false,
        previewCurrentTime: 0,
        previewDuration: 0,
      });
    }
    
    // Cleanup function for this effect
    return () => {
      if (currentRecording && state.audioPreview) {
        console.log('🧹 Effect cleanup - pausing audio');
        state.audioPreview.audio.pause();
      }
    };
  }, [currentRecording]); // Only depend on currentRecording, not state.audioPreview

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.audioPreview) {
        cleanupAudioPreview(state.audioPreview);
      }
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
