import { BaseAIService } from '@/shared/services/ai/base-ai-service';
import { buildGeneratePrompt } from './prompts/generate-quiz';
import { buildReviewPrompt } from './prompts/build-review';
import { QuizQuestion } from '../../types';
import { Difficulty } from '@/types/common';

export interface QuizGenerationOptions {
  topic: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  numQuestions: number;
  language: 'Vietnamese' | 'English';
}

export class PracticeAIService extends BaseAIService {
  async generateQuiz(options: QuizGenerationOptions): Promise<QuizQuestion[]> {
    const prompt = buildGeneratePrompt(options);

    try {
      const response = await this.generateContent(prompt);
      const jsonData = this.parseJSONResponse(response);

      return this.parseQuestionsData(jsonData);
    } catch (error) {
      console.error('Error generating quiz:', error);
      console.error('Quiz generation options:', options);

      if (error instanceof Error && error.message.includes('parse')) {
        throw new Error(
          'Failed to process AI response. The AI returned invalid data format.'
        );
      }

      throw new Error('Failed to generate quiz. Please try again.');
    }
  }

  async generateReview(
    payloadJSON: string,
    answers: (0 | 1 | 2 | 3 | null)[],
    technology: string,
    language: 'vi' | 'en' = 'en'
  ): Promise<string> {
    const prompt = buildReviewPrompt({
      payloadJSON,
      answers,
      technology,
      language,
    });

    try {
      const response = await this.generateContent(prompt);
      const jsonString = this.extractJSONFromResponse(response);

      // Validate that we got valid JSON
      JSON.parse(jsonString);

      return jsonString;
    } catch (error) {
      console.error('Error generating review:', error);
      console.error('Review generation params:', {
        technology,
        language,
        answersCount: answers.length,
      });

      if (error instanceof Error && error.message.includes('parse')) {
        throw new Error(
          'Failed to process AI review response. The AI returned invalid data format.'
        );
      }

      throw new Error('Failed to generate review. Please try again.');
    }
  }

  private parseQuestionsData(jsonData: any): QuizQuestion[] {
    const questions = jsonData.questions || jsonData.items || [];

    if (!Array.isArray(questions)) {
      throw new Error('Invalid response format: missing questions array');
    }

    return questions.map((q: any, index: number) => ({
      id: q.id || Date.now() + index,
      question: q.question || q.text || '',
      options: q.options || q.choices || [],
      correctAnswer:
        q.correctAnswer !== undefined ? q.correctAnswer : q.answerIndex || 0,
      explanation: q.explanation || '',
      difficulty: (
        (q.difficulty as Difficulty) || 'Intermediate'
      ).toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
      tags: q.tags || [],
    }));
  }
}
