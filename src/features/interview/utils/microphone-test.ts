export interface MicrophoneTestResult {
  hasPermission: boolean;
  isWorking: boolean;
  audioLevel: number;
  error?: string;
}

export interface AudioDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export class MicrophoneTestService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private selectedDeviceId: string | null = null;
  private gainNode: GainNode | null = null;

  /**
   * Get available audio input devices
   */
  async getAudioInputDevices(): Promise<AudioDevice[]> {
    try {
      // Request permission first to get device labels
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind,
        }));

      return audioInputs;
    } catch (error) {
      console.error('Failed to enumerate audio devices:', error);
      return [];
    }
  }

  /**
   * Set the selected audio device
   */
  setSelectedDevice(deviceId: string): void {
    this.selectedDeviceId = deviceId;
  }

  /**
   * Get currently selected device ID
   */
  getSelectedDevice(): string | null {
    return this.selectedDeviceId;
  }

  /**
   * Test microphone permission and functionality
   */
  async testMicrophone(): Promise<MicrophoneTestResult> {
    try {
      // Request microphone permission with device selection
      const constraints: MediaStreamConstraints = {
        audio: this.selectedDeviceId
          ? {
              deviceId: { exact: this.selectedDeviceId },
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            }
          : {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            },
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Check if we got the stream
      if (!this.stream) {
        return {
          hasPermission: false,
          isWorking: false,
          audioLevel: 0,
          error: 'Failed to access microphone',
        };
      }

      // Test if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        return {
          hasPermission: true,
          isWorking: false,
          audioLevel: 0,
          error: 'Browser does not support audio recording',
        };
      }

      // Create audio context for level monitoring
      this.audioContext = new AudioContext({ sampleRate: 44100 });
      const source = this.audioContext.createMediaStreamSource(this.stream);

      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 5.0;

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;

      const des = this.audioContext.createMediaStreamDestination();

      source.connect(this.analyser);
      this.gainNode.connect(this.analyser);
      this.gainNode.connect(des);

      return {
        hasPermission: true,
        isWorking: true,
        audioLevel: 0,
      };
    } catch (error) {
      console.error('Microphone test failed:', error);

      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage =
            'Microphone access denied. Please allow microphone permission.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Microphone is already in use by another application.';
        } else {
          errorMessage = error.message;
        }
      }

      return {
        hasPermission: false,
        isWorking: false,
        audioLevel: 0,
        error: errorMessage,
      };
    }
  }

  /**
   * Start monitoring audio levels
   */
  startAudioLevelMonitoring(callback: (level: number) => void): void {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateLevel = () => {
      if (!this.analyser) return;

      this.analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      const level = Math.round((average / 255) * 100);

      callback(level);
      this.animationFrame = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }

  /**
   * Stop audio level monitoring
   */
  stopAudioLevelMonitoring(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Test recording functionality
   */
  async testRecording(
    duration: number = 3000
  ): Promise<{ success: boolean; blob?: Blob; error?: string }> {
    if (!this.stream) {
      return { success: false, error: 'No microphone stream available' };
    }

    try {
      const chunks: Blob[] = [];
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=pcm',
      });

      return new Promise((resolve) => {
        if (!this.mediaRecorder) {
          resolve({ success: false, error: 'Failed to create MediaRecorder' });
          return;
        }

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          // const url = URL.createObjectURL(blob);

          // Auto download file
          // const a = document.createElement('a');
          // a.href = url;
          // a.download = 'microphone-test.webm'; // tên file mặc định
          // document.body.appendChild(a);
          // a.click();
          // document.body.removeChild(a);

          resolve({ success: true, blob });
        };

        this.mediaRecorder.onerror = () => {
          resolve({ success: false, error: 'Recording failed' });
        };

        // Start recording
        this.mediaRecorder.start();

        // Stop after duration
        setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
          }
        }, duration);
      });
    } catch (error) {
      console.error('Test recording failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Recording test failed',
      };
    }
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopAudioLevelMonitoring();

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      void this.audioContext.close();
      this.audioContext = null;
    }

    this.analyser = null;
    this.mediaRecorder = null;
    this.selectedDeviceId = null;
  }
}
