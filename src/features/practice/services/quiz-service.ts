import { Quiz, QuizAttempt } from '../types';
import { GenerateQuizInput } from '../store/quiz-generator-store';
import { useQuizGeneratorStore } from '../store/quiz-generator-store';
import { useQuizSessionStore } from '../store/quiz-session-store';
import { useProgressStore } from '../store/progress-store';

export class QuizService {
  private static instance: QuizService;

  static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  /**
   * Generate quiz using local AI only
   */
  async generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
    try {
      console.log('🤖 Generating quiz with local AI:', input.topic);
      return await this.generateQuizLocally(input);
    } catch (error) {
      console.error('❌ Quiz generation failed:', error);
      throw error instanceof Error
        ? error
        : new Error('Quiz generation failed');
    }
  }

  /**
   * Quiz generation using Zustand store and local AI
   */
  private async generateQuizLocally(input: GenerateQuizInput): Promise<Quiz> {
    const { startGeneration } = useQuizGeneratorStore.getState();

    // Start generation using local AI
    await startGeneration({
      topic: input.topic,
      technology: input.technology,
      difficulty: input.difficulty,
      questionCount: input.questionCount,
      language: input.language || 'en',
    });

    // Poll for result
    return new Promise((resolve, reject) => {
      const checkResult = () => {
        const currentState = useQuizGeneratorStore.getState();

        if (currentState.generationError) {
          reject(new Error(currentState.generationError));
          return;
        }

        if (currentState.generatedQuiz && !currentState.isGenerating) {
          console.log(
            '✅ Quiz generated locally:',
            currentState.generatedQuiz.title
          );
          resolve(currentState.generatedQuiz);
          return;
        }

        if (currentState.isGenerating) {
          setTimeout(checkResult, 100);
        } else {
          reject(new Error('Quiz generation failed without error message'));
        }
      };

      setTimeout(checkResult, 100);
    });
  }

  /**
   * Save quiz attempt locally only
   */
  saveQuizAttempt(attempt: QuizAttempt): QuizAttempt {
    try {
      // Save to local Zustand store
      const { saveQuizAttempt } = useProgressStore.getState();

      const localAttempt: QuizAttempt = {
        ...attempt,
        id: attempt.id || Date.now().toString(),
      };

      // Save to store
      saveQuizAttempt(localAttempt);

      console.log('✅ Quiz attempt saved locally:', localAttempt.id);
      return localAttempt;
    } catch (error) {
      console.error('❌ Failed to save quiz attempt:', error);
      throw error instanceof Error
        ? error
        : new Error('Failed to save quiz attempt');
    }
  }

  /**
   * Start quiz session in local store
   */
  startQuizSession(quiz: Quiz): void {
    const { startQuiz } = useQuizSessionStore.getState();
    startQuiz(quiz);
    console.log('🎯 Quiz session started:', quiz.title);
  }

  /**
   * Get quiz by ID from local store only
   */
  getQuizById(id: number): Quiz | null {
    try {
      // Check local Zustand store
      const { generatedQuiz } = useQuizGeneratorStore.getState();
      if (generatedQuiz && generatedQuiz.id === id) {
        console.log('✅ Quiz found in local store:', generatedQuiz.title);
        return generatedQuiz;
      }

      console.warn('⚠️ Quiz not found in local store:', id);
      return null;
    } catch (error) {
      console.error('❌ Failed to get quiz:', error);
      return null;
    }
  }

  /**
   * Combined generate and start flow
   */
  async generateAndStartQuiz(
    input: GenerateQuizInput,
    navigate: (path: string) => void
  ): Promise<Quiz> {
    try {
      const quiz = await this.generateQuiz(input);
      this.startQuizSession(quiz);
      navigate(`/practice/${quiz.id}`);
      return quiz;
    } catch (error) {
      console.error('❌ Failed to generate and start quiz:', error);
      throw error;
    }
  }

  /**
   * Clear all local quiz data
   */
  clearLocalData(): void {
    try {
      const { resetGeneration } = useQuizGeneratorStore.getState();
      const { resetQuiz } = useQuizSessionStore.getState();

      resetGeneration();
      resetQuiz();

      console.log('✅ Local quiz data cleared');
    } catch (error) {
      console.error('❌ Failed to clear local data:', error);
    }
  }
}

// Export singleton instance
export const quizService = QuizService.getInstance();
