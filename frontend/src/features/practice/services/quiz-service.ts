import type { Quiz } from '../types';
import {
  PracticeAIService,
  type QuizGenerationOptions,
} from './ai/practice-ai-service';

export interface GenerateQuizInput {
  topic: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
  language?: 'en' | 'vi';
  focusArea?: string;
}

export interface GenerateReviewRequest {
  payloadJSON: string;
  answers: (0 | 1 | 2 | 3 | null)[];
  technology: string;
  language?: 'vi' | 'en';
}

export class QuizService {
  private practiceAI: PracticeAIService;

  constructor(practiceAI: PracticeAIService) {
    this.practiceAI = practiceAI;
  }

  /**
   * Generate quiz using AI service
   * Pure function - no side effects
   */
  async generateQuiz(request: GenerateQuizInput): Promise<Quiz> {
    // Transform request to AI format
    const aiOptions: QuizGenerationOptions = {
      topic: request.topic,
      technology: request.technology,
      difficulty: request.difficulty,
      numQuestions: request.questionCount,
      language: request.language === 'vi' ? 'Vietnamese' : 'English',
      focusArea: request.focusArea,
    };

    // Call AI service
    const questions = await this.practiceAI.generateQuiz(aiOptions);

    // Transform AI response to Quiz format
    const quiz: Quiz = {
      id: Date.now(),
      title: `${request.technology} ${request.topic} - ${request.difficulty} Quiz`,
      topic: request.topic,
      topicId: Date.now(),
      technology: request.technology,
      difficulty: request.difficulty.toLowerCase() as
        | 'beginner'
        | 'intermediate'
        | 'advanced',
      questions,
      timeLimit: request.questionCount * 120, // 2 minutes per question
      createdAt: new Date(),
    };

    return quiz;
  }

  /**
   * Generate quiz review using AI service
   * Pure function - no side effects
   */
  async generateReview(request: GenerateReviewRequest): Promise<string> {
    return await this.practiceAI.generateReview(
      request.payloadJSON,
      request.answers,
      request.technology,
      request.language || 'en'
    );
  }

  /**
   * Helper to convert quiz and answers to review format
   */
  prepareReviewPayload(
    quiz: Quiz,
    userAnswers: Record<number, number>
  ): {
    payloadJSON: string;
    answers: (0 | 1 | 2 | 3 | null)[];
  } {
    // Create quiz payload for AI
    const quizPayload = {
      meta: {
        topic: quiz.title,
        difficulty: quiz.difficulty,
        language: 'en',
        numQuestions: quiz.questions.length,
        technology: quiz.technology,
      },
      items: quiz.questions.map((q) => ({
        id: q.id.toString(),
        question: q.question,
        choices: q.options,
        answerIndex: q.correctAnswer,
        explanation: q.explanation,
        tags: q.tags || [quiz.technology.toLowerCase()],
      })),
    };

    // Convert user answers to AI format
    const answers: (0 | 1 | 2 | 3 | null)[] = quiz.questions.map((question) => {
      const userAnswer = userAnswers[question.id];
      if (userAnswer === undefined || userAnswer === null) return null;
      if (userAnswer === 0) return 0;
      if (userAnswer === 1) return 1;
      if (userAnswer === 2) return 2;
      if (userAnswer === 3) return 3;
      return null; // Fallback for invalid values
    });

    return {
      payloadJSON: JSON.stringify(quizPayload),
      answers,
    };
  }
}
