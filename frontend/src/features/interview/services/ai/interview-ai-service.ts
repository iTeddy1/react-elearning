import {
  AIServiceConfig,
  BaseAIService,
} from '@/shared/services/ai/base-ai-service';
import { Language } from '@/shared/types/ai';
import { Difficulty } from '@/types/common';
import {
  getMockQuestionsByRole,
  getMockInterviewReview,
  INTERVIEW_MOCK_CONFIG,
  simulateDelay,
} from '@/features/interview/mocks/interview-mock-data';
import { interviewConfig } from '../../config';

export interface InterviewQuestion {
  id: string;
  category: string;
  question: string;
  difficulty: Difficulty;
  expectedTopics: string[];
  followUpQuestions?: string[];
}

export interface InterviewFeedback {
  overallScore: number;
  scores: {
    technicalKnowledge: number;
    communicationSkills: number;
    problemSolving: number;
    professionalism: number;
    overallFit: number;
    confidence: number;
    articulation: number;
    responseDepth: number;
  };
  communicationMetrics: {
    clarity: number;
    pace: number;
    vocabulary: number;
    grammarAccuracy: number;
    fillerWords: number;
    structuredThinking: number;
  };
  questionAnalysis: Array<{
    questionIndex: number;
    questionId: string;
    score: number;
    transcription: string;
    detailedScores: {
      technicalAccuracy: number;
      relevance: number;
      completeness: number;
      clarity: number;
    };
    strengths: string[];
    weaknesses: string[];
    feedback: string;
    criticalPoints: string[];
    improvementAreas: string[];
  }>;
  overallFeedback: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    summary: string;
    decision: 'RECOMMEND' | 'MAYBE' | 'NOT_RECOMMEND';
    hiringPotential: string;
    redFlags: string[];
    standoutMoments: string[];
    criticalConcerns: string[];
  };
}

export interface AnswerAnalysis {
  transcription: string;
  score: number;
  analysis: {
    relevance: number;
    technicalAccuracy: number;
    clarity: number;
    completeness: number;
    professionalism: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  feedback: string;
}

export interface GenerateQuestionsOptions {
  role: string;
  experience: string;
  roundType: string;
  skills: string[];
  numberOfQuestions: number;
  difficulty: Difficulty;
  language?: Language;
  resumeText?: string;
}

export interface AnalyzeAnswerOptions {
  question: string;
  questionId: string;
  questionIndex: number;
  expectedTopics: string[];
  audioBlob: Blob;
  language?: Language;
  metadata?: {
    category: string;
    difficulty: Difficulty;
    duration?: number;
    timestamp?: string;
  };
}

export interface ReviewInterviewOptions {
  questions: InterviewQuestion[];
  answers: Array<{
    questionId: string;
    questionIndex: number;
    question: string;
    expectedTopics: string[];
    audioBlob: Blob;
    duration?: number;
    recordedAt: string;
    metadata?: Record<string, any>;
  }>;
  role: string;
  language?: Language;
  interviewMetadata?: {
    interviewId: string;
    candidateName?: string;
    interviewDate: string;
    totalDuration: number;
    environment?: string; // 'web', 'mobile', etc.
  };
}

export interface InterviewAIServiceConfig extends AIServiceConfig {}

export class InterviewAIService extends BaseAIService {
  constructor(config: InterviewAIServiceConfig) {
    super(config);
  }

  async generateInterviewQuestions(
    options: GenerateQuestionsOptions
  ): Promise<InterviewQuestion[]> {
    const {
      role,
      experience,
      roundType,
      skills,
      numberOfQuestions,
      difficulty,
      language = 'en',
      resumeText,
    } = options;

    // Use mock data if configured or if offline
    if (INTERVIEW_MOCK_CONFIG.USE_MOCK_DATA || !navigator.onLine) {
      console.log('Using mock data for interview questions generation');
      await simulateDelay(INTERVIEW_MOCK_CONFIG.MOCK_GENERATION_DELAY);
      return getMockQuestionsByRole(role, difficulty, numberOfQuestions);
    }

    try {
      const contextParts = [
        `Role: ${role}`,
        `Experience: ${experience}`,
        `Round Type: ${roundType}`,
        `Difficulty: ${difficulty}`,
        `Language: ${language}`,
        skills.length > 0 ? `Skills: ${skills.join(', ')}` : null,
        resumeText ? `Resume Context: ${resumeText}` : null,
      ].filter(Boolean);

      const response = await this.post<{
        questions?: Array<{
          id?: string;
          category?: string;
          question?: string;
          difficulty?: string;
          expectedTopics?: string[];
          followUpQuestions?: string[];
        }>;
      }>(interviewConfig.API_ENDPOINTS.generateQuestions, {
        context: contextParts.join('\n'),
        count: numberOfQuestions,
      });

      return this.parseQuestionsData({ questions: response.questions || [] });
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw this.toNetworkError(error, 'generate interview questions');
    }
  }

  async reviewInterview(
    options: ReviewInterviewOptions
  ): Promise<InterviewFeedback> {
    const { questions, answers, role } = options;

    // Keep review generation local while backend review endpoint is not available.
    if (INTERVIEW_MOCK_CONFIG.USE_MOCK_DATA || !navigator.onLine) {
      console.log('Using mock data for interview review');
      await simulateDelay(INTERVIEW_MOCK_CONFIG.MOCK_REVIEW_DELAY);

      // Determine performance level based on mock data
      const performanceLevel =
        answers.length >= 5 ? 'good' : answers.length >= 3 ? 'average' : 'poor';
      const difficulty =
        questions[0]?.difficulty?.toLowerCase() || 'intermediate';

      return getMockInterviewReview(role, difficulty, performanceLevel);
    }

    try {
      const performanceLevel =
        answers.length >= 5 ? 'good' : answers.length >= 3 ? 'average' : 'poor';
      const difficulty = questions[0]?.difficulty?.toLowerCase() || 'intermediate';
      const fallback = getMockInterviewReview(role, difficulty, performanceLevel);

      return fallback;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Failed to generate interview review:', errorMessage);

      // Re-throw error with context for UI to handle
      throw new Error(`AI Review Failed: ${errorMessage}`);
    }
  }

  private parseQuestionsData(data: {
    questions: Array<{
      id?: string;
      category?: string;
      question?: string;
      difficulty?: string;
      expectedTopics?: string[];
      followUpQuestions?: string[];
    }>;
  }): InterviewQuestion[] {
    if (!data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid response format: missing questions array');
    }

    return data.questions.map((q, index) => ({
      id: q.id || `interview_question_${Date.now()}_${index}`,
      category: q.category || 'General',
      question: q.question || '',
      difficulty: this.normalizeDifficulty(q.difficulty) || 'Intermediate',
      expectedTopics: q.expectedTopics || [],
      followUpQuestions: q.followUpQuestions || [],
    }));
  }

  private normalizeDifficulty(difficulty?: string): Difficulty {
    if (!difficulty) return 'Intermediate';

    const normalized = difficulty.toLowerCase();
    if (normalized.includes('beginner') || normalized.includes('easy'))
      return 'Beginner';
    if (normalized.includes('advanced') || normalized.includes('hard'))
      return 'Advanced';
    return 'Intermediate';
  }
}
