import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Target,
  BookOpen,
  Lightbulb,
  Award,
  AlertCircle,
  Loader,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuizReviewSelectors } from '../store/quiz-review-store';

interface QuizReviewDisplayProps {
  onRegenerateReview?: () => void;
  onClose?: () => void;
}

const QuizReviewDisplay: React.FC<QuizReviewDisplayProps> = ({
  onRegenerateReview,
  onClose,
}) => {
  const {
    review,
    isLoading,
    error,
    scorePercentage,
    accuracy,
    strongTags,
    weakTags,
  } = useQuizReviewSelectors();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Generating Your Review
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Our AI is analyzing your performance and preparing personalized
            insights...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Review Generation Failed
          </h3>
          <p className="text-sm text-gray-600 mt-1 max-w-md">{error}</p>
          {onRegenerateReview && (
            <Button
              onClick={onRegenerateReview}
              className="mt-4"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No review available</p>
      </div>
    );
  }

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return { text: 'Excellent', color: 'bg-green-500' };
    if (percentage >= 80) return { text: 'Good', color: 'bg-blue-500' };
    if (percentage >= 70) return { text: 'Fair', color: 'bg-yellow-500' };
    return { text: 'Needs Improvement', color: 'bg-red-500' };
  };

  const performance = getPerformanceLevel(scorePercentage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            AI Performance Review
          </h2>
          <p className="text-gray-600">
            Personalized insights and recommendations based on your quiz
            performance
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        )}
      </div>

      {/* Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full ${performance.color} mx-auto mb-2 flex items-center justify-center`}
              >
                <span className="text-2xl font-bold text-white">
                  {review.score}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Score: {review.score}/{review.total}
              </p>
              <Badge variant="secondary" className="mt-1">
                {performance.text}
              </Badge>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {Math.round(accuracy)}%
              </div>
              <p className="text-sm text-gray-600">Accuracy Rate</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {Object.keys(review.perTagAccuracy || {}).length}
              </div>
              <p className="text-sm text-gray-600">Topics Assessed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-gray-800 leading-relaxed">{review.comment}</p>
          </div>
        </CardContent>
      </Card>

      {/* Strengths and Weaknesses */}
      {(strongTags.length > 0 || weakTags.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          {strongTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-5 h-5" />
                  Strong Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {strongTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-green-100 text-green-800 border-green-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  You performed well in these areas. Keep up the good work!
                </p>
              </CardContent>
            </Card>
          )}

          {/* Weaknesses */}
          {weakTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <TrendingDown className="w-5 h-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {weakTags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-red-100 text-red-800 border-red-300"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Focus on these topics to improve your understanding.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Recommended Topics */}
      {review.recommendedTopics && review.recommendedTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Recommended Study Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {review.recommendedTopics.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 text-sm">{topic}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Study Tips */}
      {review.tips && review.tips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Study Tips & Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {review.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                  <p className="text-gray-800 text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        {onRegenerateReview && (
          <Button variant="outline" onClick={onRegenerateReview}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate Review
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuizReviewDisplay;
