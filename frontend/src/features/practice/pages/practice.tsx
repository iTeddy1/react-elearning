import { useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Layout from '@/components/layout/layout';
import { Zap } from 'lucide-react';
import { useQuizSessionStore } from '../store/quiz-session-store';
import { useQuizReviewStore } from '../store/quiz-review-store';
import { useQuizGeneratorStore } from '../store/quiz-generator-store';

import CreateQuizForm from '@/features/practice/components/create-quiz-form';

const Practice = () => {
  const { resetQuiz } = useQuizSessionStore();
  const { clearReview } = useQuizReviewStore();
  const { resetGeneration } = useQuizGeneratorStore();

  useEffect(() => {
    // Ensure starting from Practice always begins a fresh quiz lifecycle.
    resetQuiz();
    clearReview();
    resetGeneration();
  }, [resetQuiz, clearReview, resetGeneration]);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Practice Your React Skills
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
            Test your knowledge with interactive quizzes powered by AI. Get
            instant feedback, detailed explanations, and track your progress
            over time.
          </p>
        </div>

        {/* AI Quiz Generator */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Create Custom Quiz with AI
            </CardTitle>
            <CardDescription className="text-center">
              Generate personalized quizzes on any topic using artificial
              intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateQuizForm />
          </CardContent>
        </Card>

        {/* AI-Powered Notice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            AI-Powered Learning Experience
          </h3>
          <p className="text-gray-600">
            Our quizzes are generated and analyzed using Google&apos;s AI
            technology to provide personalized feedback, adaptive difficulty,
            and detailed explanations for each question.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Practice;
