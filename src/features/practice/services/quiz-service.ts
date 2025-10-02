import { useQuizGeneratorStore } from '../store/quiz-generator-store';
import { useQuizSessionStore } from '../store/quiz-session-store';
import { GenerateQuizInput } from '../store/quiz-generator-store';
import { Quiz, QuizAttempt } from '../type';

// Enhanced Quiz Service with proper error handling
export class QuizService {
  private static instance: QuizService;

  static getInstance(): QuizService {
    if (!QuizService.instance) {
      QuizService.instance = new QuizService();
    }
    return QuizService.instance;
  }

  // Generate quiz with proper error handling and return promise for React Query
  async generateQuiz(input: GenerateQuizInput): Promise<Quiz> {
    try {
      console.log('Generating quiz with data:', input);
      
      // Get store actions
      const { startGeneration } = useQuizGeneratorStore.getState();
      
      // Start quiz generation
      await startGeneration({
        topic: input.topic,
        difficulty: input.difficulty,
        questionCount: input.questionCount,
        language: input.language || 'en',
      });
      
      // Poll for result or error
      return new Promise((resolve, reject) => {
        const checkResult = () => {
          const currentState = useQuizGeneratorStore.getState();
          
          if (currentState.generationError) {
            reject(new Error(currentState.generationError));
            return;
          }
          
          if (currentState.generatedQuiz && !currentState.isGenerating) {
            resolve(currentState.generatedQuiz);
            return;
          }
          
          // If still generating, check again
          if (currentState.isGenerating) {
            setTimeout(checkResult, 100);
          } else {
            reject(new Error('Quiz generation failed without error message'));
          }
        };
        
        // Start checking after a short delay
        setTimeout(checkResult, 100);
      });
      
    } catch (error) {
      console.error('Error generating quiz:', error);
      throw error instanceof Error ? error : new Error('Quiz generation failed');
    }
  }

  // Start quiz session
  startQuizSession(quiz: Quiz): void {
    const { startQuiz } = useQuizSessionStore.getState();
    startQuiz(quiz);
  }

  // Save quiz attempt
  async saveQuizAttempt(attempt: QuizAttempt): Promise<QuizAttempt> {
    try {
      // In a real app, this would make an API call
      // For now, we'll just simulate and return the attempt
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      return attempt;
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      throw error instanceof Error ? error : new Error('Failed to save quiz attempt');
    }
  }

  // Generate and start quiz (for backward compatibility)
  generateAndStartQuiz(
    input: GenerateQuizInput,
    navigate: (path: string) => void
  ): void {
    // Handle async internally with proper error logging
    this.executeQuizGeneration(input, navigate).catch((error) => {
      console.error('Failed to generate and start quiz:', error);
    });
  }

  private async executeQuizGeneration(
    input: GenerateQuizInput,
    navigate: (path: string) => void
  ): Promise<void> {
    try {
      const quiz = await this.generateQuiz(input);
      
      // Start the quiz session
      this.startQuizSession(quiz);
      
      // Navigate to quiz taking page
      navigate(`/practice/${quiz.id}`);
      
    } catch (error) {
      console.error('Error in quiz generation flow:', error);
      throw error;
    }
  }
}
