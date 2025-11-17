/**
 * Unified utility functions for interview functionality
 */

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds: number): string => {
  // Handle NaN, undefined, null, or negative values
  if (!seconds || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate progress percentage
 */
export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return ((current + 1) / total) * 100;
};

/**
 * Check if a question has been answered
 */
export const hasQuestionRecording = (
  questionId: string,
  recordings: Array<{ questionId: string }>
): boolean => {
  return recordings.some((r) => r.questionId === questionId);
};

/**
 * Check if all questions have been answered
 */
export const areAllQuestionsAnswered = (
  questions: Array<{ id: string }>,
  recordings: Array<{ questionId: string }>
): boolean => {
  return questions.every((q) => hasQuestionRecording(q.id, recordings));
};

/**
 * Create audio preview object
 */
export const createAudioPreview = (
  blob: Blob,
  onLoadedMetadata: (duration: number) => void,
  onTimeUpdate: (currentTime: number) => void,
  onEnded: () => void
): { url: string; audio: HTMLAudioElement } => {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);

  let metadataLoaded = false;

  const tryLoadDuration = (attempt: number = 0) => {
    const duration = audio.duration;
    console.log(
      `🔍 Duration check (attempt ${attempt}):`,
      duration,
      'readyState:',
      audio.readyState
    );

    if (!isNaN(duration) && isFinite(duration) && duration > 0) {
      if (!metadataLoaded) {
        metadataLoaded = true;
        console.log('✅ Valid duration found:', duration);
        onLoadedMetadata(duration);
      }
    } else if (attempt < 10) {
      // Retry up to 10 times with increasing delays
      setTimeout(() => tryLoadDuration(attempt + 1), 100 + attempt * 50);
    } else {
      console.warn('⚠️ Could not load valid duration after retries');
      // Fallback: estimate from blob size (rough approximation)
      const estimatedDuration = blob.size / 16000; // Assuming ~16KB/s bitrate
      onLoadedMetadata(estimatedDuration);
    }
  };

  audio.addEventListener('loadedmetadata', () => {
    console.log('📡 loadedmetadata event fired, readyState:', audio.readyState);
    tryLoadDuration(0);
  });

  audio.addEventListener('durationchange', () => {
    console.log('📡 durationchange event fired, duration:', audio.duration);
    if (!metadataLoaded) {
      tryLoadDuration(0);
    }
  });

  audio.addEventListener('canplay', () => {
    console.log('📡 canplay event fired, duration:', audio.duration);
    if (!metadataLoaded) {
      tryLoadDuration(0);
    }
  });

  audio.addEventListener('timeupdate', () => {
    onTimeUpdate(audio.currentTime);
  });

  audio.addEventListener('ended', onEnded);

  audio.addEventListener('error', (e) => {
    console.error('❌ Audio error:', e);
  });

  // Preload the audio and force load
  audio.preload = 'metadata';
  audio.load();

  // Also try to get duration after a short delay as fallback
  setTimeout(() => {
    if (!metadataLoaded) {
      tryLoadDuration(0);
    }
  }, 100);

  return { url, audio };
};

/**
 * Clean up audio preview resources
 */
export const cleanupAudioPreview = (
  audioPreview: { url: string; audio: HTMLAudioElement } | null
): void => {
  if (audioPreview) {
    audioPreview.audio.pause();
    URL.revokeObjectURL(audioPreview.url);
  }
};

/**
 * Reset audio preview state
 */
export const resetAudioState = () => ({
  currentRecording: null,
  recordingDuration: 0,
  isPlayingPreview: false,
  previewCurrentTime: 0,
  previewDuration: 0,
});

/**
 * Get question status for visual indicators
 */
export const getQuestionStatus = (
  questionId: string,
  index: number,
  currentQuestionIndex: number,
  recordings: Array<{ questionId: string }>
): 'completed' | 'current' | 'pending' => {
  if (hasQuestionRecording(questionId, recordings)) {
    return 'completed';
  }
  if (index === currentQuestionIndex) {
    return 'current';
  }
  return 'pending';
};

/**
 * Get status color class for question indicators
 */
export const getStatusColorClass = (
  status: 'completed' | 'current' | 'pending'
): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'current':
      return 'bg-blue-500';
    case 'pending':
      return 'bg-gray-300';
    default:
      return 'bg-gray-300';
  }
};
