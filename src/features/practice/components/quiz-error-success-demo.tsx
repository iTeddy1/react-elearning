import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import {
  useGenerateQuizMutation,
  useGenerateAndStartQuizMutation,
  useSubmitQuizMutation,
  useQuizNotifications,
} from '../hooks/use-quiz-queries';
import { useQuizGeneratorStore } from '../store/quiz-generator-store';
import { useQuizSessionStore } from '../store/quiz-session-store';

export default function QuizErrorSuccessDemo() {
  const notifications = useQuizNotifications();
  
  // Different mutation hooks to demonstrate error/success handling
  const generateMutation = useGenerateQuizMutation();
  const generateAndStartMutation = useGenerateAndStartQuizMutation();
  const submitMutation = useSubmitQuizMutation();
  
  // Store states for demonstration
  const { generatedQuiz, generationError, isGenerating } = useQuizGeneratorStore();
  const { currentQuiz } = useQuizSessionStore();

  // Demo functions
  const handleGenerateQuiz = () => {
    generateMutation.mutate({
      topic: 'React Hooks',
      difficulty: 'Intermediate',
      questionCount: 5,
      language: 'en',
    });
  };

  const handleGenerateAndStartQuiz = () => {
    generateAndStartMutation.mutate({
      topic: 'JavaScript ES6',
      difficulty: 'Advanced',
      questionCount: 8,
      language: 'en',
    });
  };

  const handleSubmitQuizAttempt = () => {
    if (!currentQuiz) {
      notifications.showError('No active quiz to submit');
      return;
    }

    const mockAttempt = {
      id: Date.now(),
      quizId: currentQuiz.id,
      score: 75,
      completedAt: new Date().toISOString(),
      timeSpent: 300, // 5 minutes
      answers: currentQuiz.questions.map((q, i) => ({
        questionId: q.id,
        selectedOption: i % 2, // Mock answers
        isCorrect: i % 2 === q.correctAnswer,
        timeSpent: 30, // 30 seconds per question
      })),
      totalQuestions: currentQuiz.questions.length,
      percentage: 75,
      topicId: 1,
      topicName: 'Practice',
      difficulty: currentQuiz.difficulty,
    };

    submitMutation.mutate(mockAttempt);
  };

  const handleTestNotifications = () => {
    notifications.showSuccess('This is a success message!');
    setTimeout(() => notifications.showError('This is an error message!'), 1000);
    setTimeout(() => notifications.showInfo('This is an info message!'), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>🔥 React Query + Zustand Error & Success Handling Demo</CardTitle>
          <CardDescription>
            Demonstrating best practices for error handling, success states, and notifications
            using React Query mutations combined with Zustand stores.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generate Quiz Demo */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleGenerateQuiz}
              disabled={generateMutation.isPending}
              variant="outline"
            >
              {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Quiz Only
            </Button>
            <div className="flex items-center space-x-2">
              {generateMutation.isSuccess && <CheckCircle className="h-4 w-4 text-green-500" />}
              {generateMutation.isError && <XCircle className="h-4 w-4 text-red-500" />}
              {generateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
              <span className="text-sm">
                {generateMutation.isPending && 'Generating...'}
                {generateMutation.isSuccess && 'Generated successfully!'}
                {generateMutation.isError && `Error: ${generateMutation.error?.message}`}
              </span>
            </div>
          </div>

          {/* Generate and Start Quiz Demo */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleGenerateAndStartQuiz}
              disabled={generateAndStartMutation.isPending}
              variant="default"
            >
              {generateAndStartMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate & Start Quiz
            </Button>
            <div className="flex items-center space-x-2">
              {generateAndStartMutation.isSuccess && <CheckCircle className="h-4 w-4 text-green-500" />}
              {generateAndStartMutation.isError && <XCircle className="h-4 w-4 text-red-500" />}
              {generateAndStartMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
              <span className="text-sm">
                {generateAndStartMutation.isPending && 'Generating and starting...'}
                {generateAndStartMutation.isSuccess && 'Started successfully!'}
                {generateAndStartMutation.isError && `Error: ${generateAndStartMutation.error?.message}`}
              </span>
            </div>
          </div>

          {/* Submit Quiz Demo */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleSubmitQuizAttempt}
              disabled={submitMutation.isPending || !currentQuiz}
              variant="secondary"
            >
              {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Quiz Attempt
            </Button>
            <div className="flex items-center space-x-2">
              {submitMutation.isSuccess && <CheckCircle className="h-4 w-4 text-green-500" />}
              {submitMutation.isError && <XCircle className="h-4 w-4 text-red-500" />}
              {submitMutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
              <span className="text-sm">
                {submitMutation.isPending && 'Submitting...'}
                {submitMutation.isSuccess && 'Submitted successfully!'}
                {submitMutation.isError && `Error: ${submitMutation.error?.message}`}
                {!currentQuiz && 'No active quiz to submit'}
              </span>
            </div>
          </div>

          {/* Notifications Demo */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleTestNotifications}
              variant="outline"
            >
              <Info className="mr-2 h-4 w-4" />
              Test Notifications
            </Button>
            <span className="text-sm text-muted-foreground">
              Check console for notification messages
            </span>
          </div>
        </CardContent>
      </Card>

      {/* State Display */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Store States</CardTitle>
          <CardDescription>Current state from Zustand stores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Generator Store</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <Badge variant={isGenerating ? 'default' : 'secondary'}>
                    {isGenerating ? 'Generating' : 'Idle'}
                  </Badge>
                </div>
                {generatedQuiz && (
                  <p className="text-green-600">✅ Quiz: {generatedQuiz.title}</p>
                )}
                {generationError && (
                  <p className="text-red-600">❌ Error: {generationError}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Session Store</h4>
              <div className="space-y-1 text-sm">
                {currentQuiz ? (
                  <div>
                    <p className="text-blue-600">🎯 Active: {currentQuiz.title}</p>
                    <p className="text-muted-foreground">
                      {currentQuiz.questions.length} questions
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active quiz</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Info */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Best Practices Implemented</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>React Query Mutations:</strong> Proper async error/success handling</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>Zustand Integration:</strong> Store state updates on success</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>Error Boundaries:</strong> Graceful error handling and logging</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>Loading States:</strong> Proper pending states and UI feedback</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>Cache Management:</strong> Query invalidation on mutations</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span><strong>Optimistic Updates:</strong> Immediate local store updates</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
