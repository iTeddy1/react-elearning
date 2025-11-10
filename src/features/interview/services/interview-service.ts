import {
  InterviewQuestion,
  InterviewReview,
  GenerateQuestionsRequest,
} from '../types';
import { InterviewAIService } from './ai/interview-ai-service';

/**
 * Pure Interview Feature Service - No UI state management
 * Only handles data transformation and AI service calls
 * Service instances are provided via AIServiceProvider
 */
export class InterviewService {
  private aiService: InterviewAIService;

  constructor(aiService: InterviewAIService) {
    this.aiService = aiService;
  }

  /**
   * Generate interview questions using AI service
   * Pure function - no side effects
   */
  async generateQuestions(
    request: GenerateQuestionsRequest
  ): Promise<InterviewQuestion[]> {
    console.log('🤖 Generating interview questions:', request.jobRole);

    const options = {
      role: request.jobRole,
      experience: request.difficulty,
      roundType: request.roundType,
      skills: [], // Could be derived from jobRole in the future
      numberOfQuestions: request.questionCount,
      difficulty: (request.difficulty.charAt(0).toUpperCase() +
        request.difficulty.slice(1)) as
        | 'Beginner'
        | 'Intermediate'
        | 'Advanced',
      language: request.language,
    };

    const aiQuestions =
      await this.aiService.generateInterviewQuestions(options);

    // Map AI service questions to interview questions
    const questions = aiQuestions.map((q) => ({
      id: q.id,
      text: q.question,
      question: q.question,
      category: q.category,
      difficulty: q.difficulty.toLowerCase() as
        | 'beginner'
        | 'intermediate'
        | 'advanced',
      expectedTopics: q.expectedTopics,
      followUpQuestions: q.followUpQuestions,
    }));

    console.log('✅ Interview questions generated:', questions.length);
    return questions;
  }

  /**
   * Generate interview review using AI service
   * Pure function - no side effects
   */
  async reviewInterview(
    questions: InterviewQuestion[],
    answers: Array<{
      questionId: string;
      questionIndex: number;
      question: string;
      expectedTopics: string[];
      audioBlob: Blob;
      duration?: number;
      recordedAt: string;
    }>,
    role: string,
    language?: 'en' | 'vi'
  ): Promise<InterviewReview> {
    console.log(
      '📋 Generating interview review for',
      questions.length,
      'questions'
    );

    const feedback = await this.aiService.reviewInterview({
      questions: questions.map((q) => ({
        id: q.id,
        category: q.category,
        question: q.question,
        difficulty: (q.difficulty.charAt(0).toUpperCase() +
          q.difficulty.slice(1)) as 'Beginner' | 'Intermediate' | 'Advanced',
        expectedTopics: q.expectedTopics,
        followUpQuestions: q.followUpQuestions,
      })),
      answers,
      role,
      language,
    });

    // Transform AI feedback to InterviewReview format
    const review: InterviewReview = {
      sessionId: Date.now().toString(),
      overallScore: feedback.overallScore,
      strengths: feedback.overallFeedback.strengths,
      weaknesses: feedback.overallFeedback.weaknesses,
      recommendations: feedback.overallFeedback.recommendations,
      detailedFeedback: feedback.overallFeedback.summary,
      questionFeedback: feedback.questionAnalysis.map((qa) => ({
        questionId: questions[qa.questionIndex]?.id || '',
        score: qa.score,
        feedback: qa.feedback,
      })),
      suggestedImprovements: feedback.overallFeedback.recommendations,
      nextSteps: feedback.overallFeedback.recommendations,
    };

    console.log('✅ Interview review generated successfully');
    return review;
  }
}
