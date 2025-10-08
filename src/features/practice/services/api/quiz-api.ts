import { api } from '../../../../lib/api';
import {
  Quiz,
  QuizAttempt,
  QuizReview,
  QuizSession,
  UserProgress,
} from '../../types';

export interface QuizFilters {
  difficulty?: string;
  topic?: string;
  technology?: string;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface QuizGenerationRequest {
  topic: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  numQuestions: number;
  language: 'Vietnamese' | 'English';
}

export interface QuizReviewRequest {
  quizId: number;
  quizPayload: string;
  userAnswers: (0 | 1 | 2 | 3 | null)[];
  technology: string;
  language?: 'vi' | 'en';
}

/**
 * Quiz API service using Axios for server communication
 * Handles all HTTP requests related to quiz functionality
 */
export class QuizAPI {
  private baseUrl = '/api/practice';

  // Quiz CRUD operations
  async getQuizzes(filters?: QuizFilters): Promise<PaginatedResponse<Quiz>> {
    const params = new URLSearchParams();
    if (filters?.difficulty) params.append('difficulty', filters.difficulty);
    if (filters?.topic) params.append('topic', filters.topic);
    if (filters?.technology) params.append('technology', filters.technology);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const response = await api.get<PaginatedResponse<Quiz>>(
      `${this.baseUrl}/quizzes?${params.toString()}`
    );
    return response.data;
  }

  async getQuizById(id: number): Promise<Quiz> {
    const response = await api.get<Quiz>(`${this.baseUrl}/quizzes/${id}`);
    return response.data;
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<Quiz> {
    const response = await api.post<Quiz>(
      `${this.baseUrl}/quizzes/generate`,
      request,
      {
        timeout: 60000, // 60 seconds for AI generation
      }
    );
    return response.data;
  }

  async saveQuiz(quiz: Omit<Quiz, 'id'>): Promise<Quiz> {
    const response = await api.post<Quiz>(`${this.baseUrl}/quizzes`, quiz);
    return response.data;
  }

  async updateQuiz(id: number, quiz: Partial<Quiz>): Promise<Quiz> {
    const response = await api.put<Quiz>(`${this.baseUrl}/quizzes/${id}`, quiz);
    return response.data;
  }

  async deleteQuiz(id: number): Promise<void> {
    await api.delete(`${this.baseUrl}/quizzes/${id}`);
  }

  // Quiz attempts and scoring
  async saveQuizAttempt(
    attempt: Omit<QuizAttempt, 'id'>
  ): Promise<QuizAttempt> {
    const response = await api.post<QuizAttempt>(
      `${this.baseUrl}/attempts`,
      attempt
    );
    return response.data;
  }

  async getQuizAttempts(filters?: {
    quizId?: number;
    userId?: string;
    limit?: number;
  }): Promise<PaginatedResponse<QuizAttempt>> {
    const params = new URLSearchParams();
    if (filters?.quizId) params.append('quizId', filters.quizId.toString());
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<PaginatedResponse<QuizAttempt>>(
      `${this.baseUrl}/attempts?${params.toString()}`
    );
    return response.data;
  }

  async getQuizAttemptById(id: string): Promise<QuizAttempt> {
    const response = await api.get<QuizAttempt>(
      `${this.baseUrl}/attempts/${id}`
    );
    return response.data;
  }

  // Quiz reviews
  async generateQuizReview(request: QuizReviewRequest): Promise<QuizReview> {
    const response = await api.post<QuizReview>(
      `${this.baseUrl}/reviews/generate`,
      request,
      {
        timeout: 45000, // 45 seconds for AI review generation
      }
    );
    return response.data;
  }

  async saveQuizReview(
    review: Omit<QuizReview, 'sessionId'>
  ): Promise<QuizReview> {
    const response = await api.post<QuizReview>(
      `${this.baseUrl}/reviews`,
      review
    );
    return response.data;
  }

  async getQuizReview(sessionId: string): Promise<QuizReview> {
    const response = await api.get<QuizReview>(
      `${this.baseUrl}/reviews/${sessionId}`
    );
    return response.data;
  }

  // User progress and statistics
  async getUserProgress(userId?: string): Promise<UserProgress> {
    const url = userId
      ? `${this.baseUrl}/progress/${userId}`
      : `${this.baseUrl}/progress`;
    const response = await api.get<UserProgress>(url);
    return response.data;
  }

  async updateUserProgress(
    progress: Partial<UserProgress>
  ): Promise<UserProgress> {
    const response = await api.put<UserProgress>(
      `${this.baseUrl}/progress`,
      progress
    );
    return response.data;
  }

  // Quiz sessions
  async createQuizSession(quizId: number): Promise<QuizSession> {
    const response = await api.post<QuizSession>(`${this.baseUrl}/sessions`, {
      quizId,
    });
    return response.data;
  }

  async updateQuizSession(
    sessionId: string,
    session: Partial<QuizSession>
  ): Promise<QuizSession> {
    const response = await api.put<QuizSession>(
      `${this.baseUrl}/sessions/${sessionId}`,
      session
    );
    return response.data;
  }

  async getQuizSession(sessionId: string): Promise<QuizSession> {
    const response = await api.get<QuizSession>(
      `${this.baseUrl}/sessions/${sessionId}`
    );
    return response.data;
  }

  // Analytics and statistics
  async getQuizStatistics(quizId?: number): Promise<{
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    difficultyDistribution: Record<string, number>;
    popularTopics: string[];
  }> {
    const url = quizId
      ? `${this.baseUrl}/statistics/quiz/${quizId}`
      : `${this.baseUrl}/statistics/overview`;
    const response = await api.get(url);
    return response.data;
  }

  // Health check and configuration
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await api.get(`${this.baseUrl}/health`);
    return response.data;
  }
}

// Singleton instance
export const quizAPI = new QuizAPI();
