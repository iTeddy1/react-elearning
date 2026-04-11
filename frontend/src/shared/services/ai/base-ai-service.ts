import axios, { AxiosError, type AxiosInstance } from 'axios';

export interface AIServiceConfig {
  baseUrl?: string;
  timeoutMs?: number;
}

export abstract class BaseAIService {
  protected http: AxiosInstance;
  protected baseUrl: string;

  constructor(config: AIServiceConfig) {
    this.baseUrl = config.baseUrl || 'http://localhost:8000';
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: config.timeoutMs ?? 300000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  protected async post<TResponse>(
    path: string,
    payload: unknown
  ): Promise<TResponse> {
    const response = await this.http.post<TResponse>(path, payload);
    return response.data;
  }

  protected toNetworkError(error: unknown, action: string): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ detail?: string; message?: string }>;

      if (!axiosError.response) {
        return new Error(
          `Unable to ${action}: cannot reach local backend at ${this.baseUrl}.`
        );
      }

      const status = axiosError.response.status;
      const backendMessage =
        axiosError.response.data?.detail || axiosError.response.data?.message;

      return new Error(
        backendMessage || `Unable to ${action}: backend returned status ${status}.`
      );
    }

    if (error instanceof Error) {
      return new Error(`Unable to ${action}: ${error.message}`);
    }

    return new Error(`Unable to ${action}: unknown error.`);
  }
}
