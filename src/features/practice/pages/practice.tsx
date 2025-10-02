import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Layout from '@/components/layout/layout';
import { Trophy, Clock, Target, Zap } from 'lucide-react';
import {
  mockQuizzes,
  getQuizzesByDifficulty,
  getUserBestScore,
  getUserAttemptCount,
  getCompletedQuizzesCount,
  getAverageScore,
  getTotalAttempts,
} from '@/data/practice-data';
import CreateQuizForm from '@/features/practice/components/create-quiz-form';
import QuizErrorSuccessDemo from '@/features/practice/components/quiz-error-success-demo';

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-100 text-green-800';
    case 'Intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'Advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getScoreColor = (score: number | null) => {
  if (!score) return 'text-gray-600';
  if (score >= 90) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

const Practice = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredTopics = getQuizzesByDifficulty(selectedDifficulty);

  const totalQuizzes = mockQuizzes.length;
  const completedQuizzes = getCompletedQuizzesCount();
  const averageScore = getAverageScore();

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
            <CardTitle className="text-2xl text-center">Create Custom Quiz with AI</CardTitle>
            <CardDescription className="text-center">
              Generate personalized quizzes on any topic using artificial intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateQuizForm />
          </CardContent>
        </Card>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {completedQuizzes}/{totalQuizzes}
                  </p>
                  <p className="text-sm text-gray-500">Quizzes Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Trophy className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(averageScore)}%
                  </p>
                  <p className="text-sm text-gray-500">Average Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {getTotalAttempts()}
                  </div>
                  <p className="text-sm text-gray-500">Total Attempts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 flex items-center mr-4">
            Filter by difficulty:
          </span>
          {difficulties.map((difficulty) => (
            <button
              key={difficulty}
              onClick={() => setSelectedDifficulty(difficulty)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedDifficulty === difficulty
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {difficulty}
            </button>
          ))}
        </div>

        {/* Practice Quizzes Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTopics.map((quiz) => {
            const bestScore = getUserBestScore(quiz.id);
            const attempts = getUserAttemptCount(quiz.id);

            return (
              <Card
                key={quiz.id}
                className="hover:shadow-lg transition-shadow duration-300"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{quiz.title}</CardTitle>
                    {bestScore && (
                      <div
                        className={`text-xl font-bold ${getScoreColor(bestScore)}`}
                      >
                        {bestScore}%
                      </div>
                    )}
                  </div>
                  <CardDescription>{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        {quiz.questions.length} questions
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {quiz.timeLimit} min
                      </span>
                    </div>

                    {attempts > 0 && (
                      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        Attempts: {attempts} | Best Score: {bestScore}%
                      </div>
                    )}

                    <Link to={`/practice/${quiz.id}`}>
                      <Button className="w-full">
                        {attempts > 0 ? 'Retake Quiz' : 'Start Quiz'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

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

        {/* React Query + Zustand Error/Success Demo */}
        <QuizErrorSuccessDemo />
      </div>
    </Layout>
  );
};

export default Practice;
