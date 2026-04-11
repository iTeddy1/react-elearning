/**
 * Shared Speech-to-Text service for audio transcription
 */

export interface SpeechToTextConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechToTextService {
  start(config?: SpeechToTextConfig): Promise<void>;
  stop(): Promise<TranscriptionResult>;
  onResult(callback: (result: TranscriptionResult) => void): void;
  onError(callback: (error: Error) => void): void;
}

/**
 * Web Speech API implementation
 */
export class WebSpeechToTextService implements SpeechToTextService {
  private recognition: any = null;
  private resultCallback?: (result: TranscriptionResult) => void;
  private errorCallback?: (error: Error) => void;

  constructor() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
    }
  }

  async start(config?: SpeechToTextConfig): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not supported');
    }

    this.recognition.lang = config?.language || 'en-US';
    this.recognition.continuous = config?.continuous || false;
    this.recognition.interimResults = config?.interimResults || true;

    this.recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      if (this.resultCallback) {
        this.resultCallback({
          text: result[0].transcript,
          confidence: result[0].confidence || 0,
          isFinal: result.isFinal,
        });
      }
    };

    this.recognition.onerror = (event: any) => {
      if (this.errorCallback) {
        this.errorCallback(new Error(event.error as string));
      }
    };

    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'));
        return;
      }

      this.recognition.onstart = () => resolve();

      this.recognition.onerror = (event: any) =>
        reject(new Error(event.error as string));
      this.recognition.start();
    });
  }

  async stop(): Promise<TranscriptionResult> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not available'));
        return;
      }

      this.recognition.onend = () => {
        resolve({
          text: '',
          confidence: 0,
          isFinal: true,
        });
      };

      this.recognition.stop();
    });
  }

  onResult(callback: (result: TranscriptionResult) => void): void {
    this.resultCallback = callback;
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
  }
}

/**
 * Factory function to create speech-to-text service
 */
export const createSpeechToTextService = (): SpeechToTextService => {
  return new WebSpeechToTextService();
};
