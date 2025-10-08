import { interviewConfig } from '../config';

export class AudioRecordingService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioStream: MediaStream | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;

  /**
   * Request microphone permission and initialize audio recording
   */
  async requestPermission(): Promise<boolean> {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      return true;
    } catch (error) {
      console.error('Failed to get microphone permission:', error);
      return false;
    }
  }

  /**
   * Start recording audio
   */
  async startRecording(): Promise<void> {
    if (!this.audioStream) {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Microphone permission denied');
      }
    }

    if (!this.audioStream) {
      throw new Error('No audio stream available');
    }

    // Reset audio chunks
    this.audioChunks = [];

    // Create media recorder
    this.mediaRecorder = new MediaRecorder(this.audioStream, {
      mimeType: this.getSupportedMimeType(),
    });

    // Set up event handlers
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    // Start recording
    this.startTime = Date.now();
    this.mediaRecorder.start(1000); // Collect data every second

    // Auto-stop after max duration
    setTimeout(() => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        void this.stopRecording();
      }
    }, interviewConfig.MAX_RECORDING_DURATION * 1000);
  }

  /**
   * Stop recording audio and return the recorded blob
   */
  async stopRecording(): Promise<{ blob: Blob; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        const blob = new Blob(this.audioChunks, {
          type: this.getSupportedMimeType(),
        });
        resolve({ blob, duration });
      };

      this.mediaRecorder.onerror = () => {
        reject(new Error('Recording error occurred'));
      };

      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
      }
    });
  }

  /**
   * Check if currently recording
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  /**
   * Get recording duration in seconds
   */
  getRecordingDuration(): number {
    if (!this.startTime) return 0;
    return Math.round((Date.now() - this.startTime) / 1000);
  }

  /**
   * Stop all audio streams and cleanup
   */
  cleanup(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    if (this.audioStream) {
      this.audioStream.getTracks().forEach(track => track.stop());
      this.audioStream = null;
    }

    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = 0;
  }

  /**
   * Get supported MIME type for recording
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // Fallback
  }

  /**
   * Convert blob to File for upload
   */
  blobToFile(blob: Blob, filename: string): File {
    return new File([blob], filename, {
      type: blob.type,
      lastModified: Date.now(),
    });
  }

  /**
   * Validate audio file
   */
  validateAudioFile(file: File): boolean {
    // Check file size (max 25MB for AssemblyAI)
    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('Audio file too large (max 25MB)');
    }

    // Check duration
    return true; // TODO: Add duration check if needed
  }
}