import {
  InterviewQuestion,
  InterviewReview,
  GenerateQuestionsRequest,
} from '../types';
import { InterviewAIService } from './ai/interview-ai-service';

/**
 * Interview Service for AI-only interview generation and management
 * Handles interview generation using local AI and manages state via Zustand stores
 */
export class InterviewService {
  private static instance: InterviewService;
  private aiService: InterviewAIService;

  constructor() {
    // Get API key from environment
    const apiKey = import.meta.env.VITE_GOOGLE_GENAI_API_KEY || '';
    const model = 'gemini-2.5-flash';

    this.aiService = new InterviewAIService({
      apiKey,
      model,
    });
  }

  static getInstance(): InterviewService {
    if (!InterviewService.instance) {
      InterviewService.instance = new InterviewService();
    }
    return InterviewService.instance;
  }

  /**
   * Generate interview questions using local AI
   */
  async generateQuestions(
    request: GenerateQuestionsRequest
  ): Promise<InterviewQuestion[]> {
    try {
      console.log(
        '🤖 Generating interview questions with local AI:',
        request.jobRole
      );

      const options = {
        role: request.jobRole,
        experience: request.difficulty, // Map difficulty to experience
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

      console.log(
        '✅ Interview questions generated successfully:',
        questions.length
      );
      return questions;
    } catch (error) {
      console.error('❌ Interview question generation failed:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to generate interview questions');
    }
  }

  /**
   * Generate interview review
   */
  reviewInterview(
    questions: InterviewQuestion[],
    answers: Array<{
      question: string;
      audioData: Blob;
      feedback: string;
      score: number;
    }>
  ): Promise<InterviewReview> {
    return new Promise((resolve, reject) => {
      try {
        console.log(
          '📋 Generating interview review for',
          questions.length,
          'questions'
        );

        const averageScore =
          answers.reduce((sum, answer) => sum + answer.score, 0) /
          answers.length;

        // Mock review data - you can implement actual AI review later
        const review: InterviewReview = {
          sessionId: Date.now().toString(),
          overallScore: Math.round(averageScore),
          strengths: [
            'Good communication skills',
            'Technical knowledge',
            'Problem-solving approach',
          ],
          weaknesses: [
            'Could provide more specific examples',
            'Consider edge cases',
          ],
          recommendations: [
            'Practice explaining complex concepts simply',
            'Prepare more STAR method examples',
          ],
          detailedFeedback: `Overall performance was good with an average score of ${Math.round(averageScore)}%.`,
          questionFeedback: answers.map((answer, index) => ({
            questionId: questions[index].id,
            score: answer.score,
            feedback: answer.feedback,
          })),
          suggestedImprovements: [
            'Provide more specific examples',
            'Practice STAR method',
          ],
          nextSteps: [
            'Schedule mock interviews',
            'Review technical concepts',
            'Practice behavioral questions',
          ],
        };

        console.log('✅ Interview review generated successfully');
        resolve(review);
      } catch (error) {
        console.error('❌ Interview review generation failed:', error);
        reject(new Error('Failed to generate interview review'));
      }
    });
  }
}

// Export singleton instance
export const interviewService = InterviewService.getInstance();
