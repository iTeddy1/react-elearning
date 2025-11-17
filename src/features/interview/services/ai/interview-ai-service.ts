import { BaseAIService } from '../../../../shared/services/ai/base-ai-service';
import { Language } from '../../../../shared/types/ai';
import { Difficulty } from '../../../../types/common';
import { generateQuestionsPrompt } from './prompts/generate-questions';
import { reviewInterviewPrompt } from './prompts/review-interview';
import {
  getMockQuestionsByRole,
  getMockInterviewReview,
  INTERVIEW_MOCK_CONFIG,
  simulateDelay,
} from '../../mocks/interview-mock-data';

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

export class InterviewAIService extends BaseAIService {
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
    } = options;

    // Use mock data if configured or if offline
    if (INTERVIEW_MOCK_CONFIG.USE_MOCK_DATA || !navigator.onLine) {
      console.log('Using mock data for interview questions generation');
      await simulateDelay(INTERVIEW_MOCK_CONFIG.MOCK_GENERATION_DELAY);
      return getMockQuestionsByRole(role, difficulty, numberOfQuestions);
    }

    const prompt = generateQuestionsPrompt(
      role,
      experience,
      roundType,
      skills,
      numberOfQuestions,
      difficulty.toLowerCase(),
      language === 'en' ? 'English' : 'Vietnamese'
    );

    try {
      const response = await this.generateContent(prompt);
      // const jsonData = this.extractJSONFromResponse(response);

      const parsedData = this.parseJSONResponse<{
        questions: Array<{
          id?: string;
          category: string;
          question: string;
          difficulty?: string;
          expectedTopics: string[];
          followUpQuestions?: string[];
        }>;
      }>(response);

      return this.parseQuestionsData(parsedData);
    } catch (error) {
      console.error('Error generating interview questions:', error);

      // Fallback to mock data on error
      console.log('Falling back to mock data due to API error');
      await simulateDelay(INTERVIEW_MOCK_CONFIG.MOCK_GENERATION_DELAY);
      return getMockQuestionsByRole(role, difficulty, numberOfQuestions);
    }
  }

  async reviewInterview(
    options: ReviewInterviewOptions
  ): Promise<InterviewFeedback> {
    const {
      questions,
      answers,
      role,
      language = 'en',
      interviewMetadata,
    } = options;

    // Use mock data if configured or if offline
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
      // Create structured data with clear question-answer mapping
      const structuredData = answers.map((answer, index) => ({
        questionNumber: index + 1,
        questionId: answer.questionId,
        question: answer.question,
        expectedTopics: answer.expectedTopics,
        category:
          questions.find((q) => q.id === answer.questionId)?.category ||
          'General',
        difficulty:
          questions.find((q) => q.id === answer.questionId)?.difficulty ||
          'Intermediate',
        recordedAt: answer.recordedAt,
        duration: answer.duration,
        audioData: answer.audioBlob,
      }));

      // Convert audio blobs to base64
      const audioBase64Array = await Promise.all(
        structuredData.map((item) => this.blobToBase64(item.audioData))
      );

      const prompt = reviewInterviewPrompt({
        role,
        language: language === 'en' ? 'English' : 'Vietnamese',
        interviewMetadata,
        questionAnswerPairs: structuredData.map((item, index) => ({
          ...item,
          audioIndex: index, // Clear reference to audio position
        })),
      });

      // Create parts array with structured metadata
      const parts: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }> = [{ text: prompt }];

      // Add each audio with clear indexing
      structuredData.forEach((item, index) => {
        parts.push({
          inlineData: {
            mimeType: item.audioData.type || 'audio/wav',
            data: audioBase64Array[index],
          },
        });
      });

      const response = await this.generateContentWithAudio(parts);
      const jsonData = this.extractJSONFromResponse(response);

      return this.parseJSONResponse<InterviewFeedback>(jsonData);
    } catch (error) {
      console.error('Error reviewing interview:', error);

      // Fallback to mock data on error
      console.log('Falling back to mock data due to API error');
      await simulateDelay(INTERVIEW_MOCK_CONFIG.MOCK_REVIEW_DELAY);

      const performanceLevel =
        answers.length >= 5 ? 'good' : answers.length >= 3 ? 'average' : 'poor';
      const difficulty =
        questions[0]?.difficulty?.toLowerCase() || 'intermediate';

      return getMockInterviewReview(role, difficulty, performanceLevel);
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data URL prefix (e.g., "data:audio/wav;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private parseQuestionsData(data: {
    questions: Array<{
      id?: string;
      category: string;
      question: string;
      difficulty?: string;
      expectedTopics: string[];
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
