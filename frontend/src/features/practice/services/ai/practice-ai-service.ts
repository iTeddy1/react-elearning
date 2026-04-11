import { BaseAIService } from '../../../../shared/services/ai/base-ai-service';
import { Difficulty } from '../../../../types/common';
import { QuizGenerateApiResponse, QuizQuestion } from '../../types';
import { practiceConfig } from '../../config';

export interface QuizGenerationOptions {
  topic: string;
  technology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  numQuestions: number;
  language: 'Vietnamese' | 'English';
  focusArea?: string;
}

export class PracticeAIService extends BaseAIService {
  async generateQuiz(options: QuizGenerationOptions): Promise<QuizQuestion[]> {
    try {
      const response = await this.http.post<
        QuizGenerateApiResponse & {
          questions?: unknown[];
          items?: unknown[];
        }
      >(
        practiceConfig.API_ENDPOINTS.generateQuiz,
        {
          topic: options.topic,
          technology: options.technology,
          difficulty: options.difficulty,
          num_questions: options.numQuestions,
          language: options.language,
          focus_area: options.focusArea?.trim() || '',
        },
        {
          timeout: 180000,
        }
      );

      return this.parseQuestionsData(response.data);
    } catch (error) {
      console.error('Error generating quiz:', error);
      console.error('Quiz generation options:', options);
      throw this.toNetworkError(error, 'generate quiz');
    }
  }

  async generateReview(
    payloadJSON: string,
    answers: (0 | 1 | 2 | 3 | null)[],
    technology: string,
    language: 'vi' | 'en' = 'en'
  ): Promise<string> {
    try {
      // Keep review generation available without cloud AI by calculating locally.
      const payload = JSON.parse(payloadJSON) as {
        items?: Array<{ answerIndex: number; tags?: string[] }>;
      };

      const items = payload.items || [];
      const total = items.length;
      const score = items.reduce((acc, item, index) => {
        return answers[index] === item.answerIndex ? acc + 1 : acc;
      }, 0);
      const accuracy = total > 0 ? score / total : 0;

      const perTagStats: Record<string, { correct: number; total: number }> = {};

      items.forEach((item, index) => {
        const tags = item.tags || ['general'];
        const isCorrect = answers[index] === item.answerIndex;

        tags.forEach((tag) => {
          if (!perTagStats[tag]) {
            perTagStats[tag] = { correct: 0, total: 0 };
          }

          perTagStats[tag].total += 1;
          if (isCorrect) {
            perTagStats[tag].correct += 1;
          }
        });
      });

      const perTagAccuracy = Object.fromEntries(
        Object.entries(perTagStats).map(([tag, stat]) => [
          tag,
          stat.total > 0 ? stat.correct / stat.total : 0,
        ])
      );

      const review = {
        score,
        total,
        accuracy,
        perTagAccuracy,
        comment:
          language === 'vi'
            ? `Ban da hoan thanh bai quiz ${technology} voi diem ${score}/${total}.`
            : `You completed the ${technology} quiz with a score of ${score}/${total}.`,
        recommendedTopics: Object.keys(perTagAccuracy).slice(0, 5),
        tips:
          language === 'vi'
            ? [
                'On lai cac cau ban tra loi sai.',
                'Luyen tap them bang cac vi du thuc te.',
                'Tap trung vao cac chu de co do chinh xac thap.',
              ]
            : [
                'Review the questions you answered incorrectly.',
                'Practice more with real-world examples.',
                'Focus on topics with lower accuracy first.',
              ],
      };

      return JSON.stringify(review);
    } catch (error) {
      console.error('Error generating review:', error);
      console.error('Review generation params:', {
        technology,
        language,
        answersCount: answers.length,
      });

      throw new Error('Failed to generate review. Please try again.');
    }
  }

  private parseQuestionsData(jsonData: unknown): QuizQuestion[] {
    const payload = jsonData as Partial<QuizGenerateApiResponse> & {
      questions?: unknown[];
      items?: unknown[];
    };

    const questions =
      (Array.isArray(payload.quiz) ? payload.quiz : null) ||
      (Array.isArray(payload.questions) ? payload.questions : null) ||
      (Array.isArray(payload.items) ? payload.items : null) ||
      [];

    if (!questions.length) {
      throw new Error('Invalid response format: missing quiz questions');
    }

    return questions.map((rawQuestion, index) => {
      const q = rawQuestion as {
        id?: number;
        question?: string;
        text?: string;
        options?: string[];
        choices?: string[];
        correctAnswer?: number;
        answerIndex?: number;
        explanation?: string;
        difficulty?: Difficulty;
        tags?: string[];
      };

      const options =
        (Array.isArray(q.options) && q.options) ||
        (Array.isArray(q.choices) && q.choices) ||
        [];

      return {
        id: q.id || Date.now() + index,
        question: q.question || q.text || '',
        options,
        correctAnswer:
          q.correctAnswer !== undefined
            ? q.correctAnswer
            : (q.answerIndex ?? 0),
        explanation: q.explanation || '',
        difficulty: (
          (q.difficulty as Difficulty) || 'Intermediate'
        ).toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
        tags: q.tags || [],
      };
    });
  }
}
