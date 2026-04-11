import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/layout';
import { useQuizSessionStore } from '../store/quiz-session-store';
import { useQuizGeneratorStore } from '../store/quiz-generator-store';
import {
  useQuizReviewStore,
  convertSessionToReviewInput,
} from '../store/quiz-review-store';
import { useGenerateReviewMutation } from '../hooks/use-quiz-queries';
import type { QuizQuestion, QuizReview } from '../types';
import QuizReviewDisplay from '../components/quiz-review-display';
import { Progress } from '@/components/ui/progress';

// Type guard for quiz review validation
function isValidQuizReview(obj: unknown): obj is QuizReview {
  if (typeof obj !== 'object' || obj === null) return false;

  const review = obj as Record<string, unknown>;

  return (
    typeof review.score === 'number' &&
    typeof review.total === 'number' &&
    typeof review.accuracy === 'number' &&
    typeof review.comment === 'string' &&
    Array.isArray(review.recommendedTopics) &&
    Array.isArray(review.tips) &&
    (typeof review.perTagAccuracy === 'object' ||
      review.perTagAccuracy === undefined)
  );
}

const QuizTaking = () => {
  // Try to get quiz from session store first (for AI-generated quizzes)
  const {
    currentQuiz,
    answers,
    isQuizActive,
    showResults,
    currentScore,
    startQuiz,
    submitAnswer,
    showQuizResults,
    resetQuiz,
  } = useQuizSessionStore();

  // Get generated quiz from generator store
  const { generatedQuiz } = useQuizGeneratorStore();

  // Quiz review state and actions
  const { setReview, setGeneratingReview, setReviewError, clearReview } =
    useQuizReviewStore();

  // React Query mutation for generating review
  const generateReviewMutation = useGenerateReviewMutation({
    onSuccess: (reviewJSON) => {
      if (!quiz) return;

      try {
        // Parse and validate review
        const parsedReview = JSON.parse(reviewJSON) as unknown;

        // Type guard for review validation
        if (!isValidQuizReview(parsedReview)) {
          throw new Error('Invalid review format received from AI');
        }

        const review: QuizReview = parsedReview;

        // Calculate expected score for validation
        const quizData = JSON.parse(
          convertSessionToReviewInput(quiz, answers).quizPayload
        ) as {
          items: Array<{ answerIndex: number }>;
        };

        const correctAnswers = answers.filter(
          (answer, index) =>
            answer.isCorrect &&
            answer.selectedOption === quizData.items[index]?.answerIndex
        );

        const expectedScore = correctAnswers.length;
        const expectedTotal = quizData.items.length;
        const expectedAccuracy =
          expectedTotal > 0 ? expectedScore / expectedTotal : 0;

        // Validate and correct AI's score if needed
        if (review.score !== expectedScore || review.total !== expectedTotal) {
          console.warn('AI score calculation was incorrect. Correcting...');
          review.score = expectedScore;
          review.total = expectedTotal;
          review.accuracy = expectedAccuracy;
        }

        // Update store with review
        setReview(review, quiz.id || 0);
        toast.success('Quiz review generated successfully!');
      } catch (error) {
        console.error('Failed to parse review:', error);
        setReviewError('Failed to parse review data');
        toast.error('Failed to generate review');
      }
    },
    onError: (error) => {
      console.error('Failed to generate review:', error);
      setReviewError(error.message);
      toast.error('Failed to generate review');
    },
  });

  // Fallback to mock data for existing quizzes

  // Determine which quiz to use
  const quiz = currentQuiz || generatedQuiz;
  const normalizedQuizQuestions = useMemo(() => {
    return Array.isArray(quiz?.questions)
      ? quiz.questions
      : Array.isArray((quiz as { quiz?: QuizQuestion[] } | null)?.quiz)
        ? ((quiz as { quiz?: QuizQuestion[] }).quiz ?? [])
        : [];
  }, [quiz]);
  const quizQuestionsVersion = `${quiz?.id ?? 'no-id'}-${normalizedQuizQuestions.length}`;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSelectedAnswer, setCurrentSelectedAnswer] = useState<
    number | null
  >(null);
  const [quizStarted, setQuizStarted] = useState(isQuizActive);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showReview, setShowReview] = useState(false);

  // Initialize quiz if we have a generated quiz but no active session
  useEffect(() => {
    if (generatedQuiz && !currentQuiz) {
      startQuiz(generatedQuiz);
      setQuizStarted(true);
    }
  }, [generatedQuiz, currentQuiz, startQuiz]);

  // Normalize incoming quiz payload to a plain questions array state.
  useEffect(() => {
    setQuestions(normalizedQuizQuestions);
    setCurrentQuestionIndex(0);
    setCurrentSelectedAnswer(null);
  }, [normalizedQuizQuestions, quizQuestionsVersion]);

  useEffect(() => {
    if (!questions.length) {
      setCurrentQuestionIndex(0);
      setCurrentSelectedAnswer(null);
      return;
    }

    setCurrentQuestionIndex((prev) => Math.min(prev, questions.length - 1));
  }, [questions.length]);

  // Sync answers with session store
  useEffect(() => {
    if (!questions.length) {
      setSelectedAnswers({});
      setCurrentSelectedAnswer(null);
      return;
    }

    const sessionAnswers: Record<number, number> = {};
    answers.forEach((answer) => {
      const questionIndex = questions.findIndex(
        (question) => question.id === answer.questionId
      );

      if (questionIndex !== -1) {
        sessionAnswers[questionIndex] = answer.selectedOption;
      }
    });

    setSelectedAnswers(sessionAnswers);
    setCurrentSelectedAnswer(sessionAnswers[currentQuestionIndex] ?? null);
  }, [answers, questions, currentQuestionIndex]);

  const startQuizHandler = () => {
    if (!quiz) return;
    if (!currentQuiz) {
      startQuiz(quiz);
    }
    setQuizStarted(true);
    setCurrentQuestionIndex(0);
    setCurrentSelectedAnswer(null);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!questions.length) return;

    const questionId = questions[currentQuestionIndex]?.id;
    if (questionId === undefined) return;

    // Update local state
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: answerIndex,
    }));
    setCurrentSelectedAnswer(answerIndex);

    // Update session store
    submitAnswer(questionId, answerIndex);
  };

  const handleNext = () => {
    if (currentQuestionIndex >= questions.length - 1) return;

    const nextIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(nextIndex);
    setCurrentSelectedAnswer(selectedAnswers[nextIndex] ?? null);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex <= 0) return;

    const prevIndex = currentQuestionIndex - 1;
    setCurrentQuestionIndex(prevIndex);
    setCurrentSelectedAnswer(selectedAnswers[prevIndex] ?? null);
  };

  const handleGoToQuestion = (index: number) => {
    if (index < 0 || index >= questions.length) return;

    setCurrentQuestionIndex(index);
    setCurrentSelectedAnswer(selectedAnswers[index] ?? null);
  };

  const handleSubmitQuiz = () => {
    showQuizResults();
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    if (showResults && currentScore > 0) {
      return currentScore;
    }

    if (questions.length === 0) return 0;

    const correctAnswers = questions.filter(
      (question, index) => selectedAnswers[index] === question.correctAnswer
    ).length;
    return Math.round((correctAnswers / questions.length) * 100);
  };

  const handleGenerateReview = async () => {
    if (!quiz || !answers.length) return;

    try {
      setShowReview(true);
      clearReview(); // Clear any previous review
      setGeneratingReview(true);

      const { quizPayload, userAnswers } = convertSessionToReviewInput(
        quiz,
        answers
      );

      console.log('Quiz payload:', JSON.parse(quizPayload));
      console.log('User answers for AI:', userAnswers);

      // Calculate expected score locally for verification
      const correctCount = answers.filter((a) => a.isCorrect).length;
      console.log('Expected score:', correctCount, '/', questions.length);

      // Call React Query mutation
      await generateReviewMutation.mutateAsync({
        payloadJSON: quizPayload,
        answers: userAnswers,
        technology: quiz.technology,
        language: 'en',
        quizId: quiz.id || 0,
      });
    } catch (error) {
      console.error('Failed to generate review:', error);
      setReviewError('Failed to generate review');
    } finally {
      setGeneratingReview(false);
    }
  };

  const handleCloseReview = () => {
    setShowReview(false);
  };

  if (!quiz) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quiz Not Found
          </h1>
          <Link to="/practice">
            <Button>Back to Practice</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  // Quiz Results Screen
  if (showResults && quiz) {
    const score = calculateScore();
    const correctAnswers = questions.filter(
      (question, index) => selectedAnswers[index] === question.correctAnswer
    ).length;

    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="text-center p-8">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Quiz Completed!</CardTitle>
              <div
                className={`text-6xl font-bold mb-4 ${score >= 70 ? 'text-green-600' : 'text-red-600'}`}
              >
                {score}%
              </div>
              <p className="text-lg text-gray-600">
                You answered {correctAnswers} out of {questions.length}{' '}
                questions correctly
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center gap-4 mt-6">
                <Button
                  onClick={() => {
                    resetQuiz();
                    setQuizStarted(false);
                    setSelectedAnswers({});
                    setShowReview(false);
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retake Quiz
                </Button>
                <Button
                  onClick={() => {
                    handleGenerateReview().catch(console.error);
                  }}
                  variant="secondary"
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Review Test
                </Button>
                <Link to="/practice">
                  <Button variant="outline">Back to Practice</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* AI Review Section */}
          {showReview && (
            <div className="mt-8">
              <QuizReviewDisplay
                onRegenerateReview={() => {
                  handleGenerateReview().catch(console.error);
                }}
                onClose={handleCloseReview}
              />
            </div>
          )}

          {/* Detailed Results */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Detailed Results</h2>
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;

              return (
                <Card key={question.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-2">
                        Question {index + 1}: {question.question}
                      </h3>
                      <div className="space-y-2 mb-4">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded text-sm ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 text-green-800 border border-green-300'
                                : optionIndex === userAnswer && !isCorrect
                                  ? 'bg-red-100 text-red-800 border border-red-300'
                                  : 'bg-gray-50'
                            }`}
                          >
                            {option}
                            {optionIndex === question.correctAnswer && (
                              <span className="ml-2 text-green-600">
                                ✓ Correct
                              </span>
                            )}
                            {optionIndex === userAnswer && !isCorrect && (
                              <span className="ml-2 text-red-600">
                                ✗ Your answer
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 p-3 rounded text-sm">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Layout>
    );
  }

  // Pre-quiz Screen
  if (!quizStarted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-8">
          <Link
            to="/practice"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Practice
          </Link>

          <Card className="p-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-4">{quiz.title}</CardTitle>
              <p className="text-gray-600 mb-6">
                {quiz.technology} - {quiz.topic}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {questions.length}
                  </div>
                  <div className="text-sm text-gray-500">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {quiz.timeLimit}
                  </div>
                  <div className="text-sm text-gray-500">Minutes</div>
                </div>
                <div className="text-center">
                  <Badge className="text-lg px-4 py-2">{quiz.difficulty}</Badge>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Instructions:
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • You have {quiz.timeLimit} minutes to complete the quiz
                  </li>
                  <li>• You can navigate back and forth between questions</li>
                  <li>• Make sure to submit before time runs out</li>
                  <li>• You can retake the quiz multiple times</li>
                </ul>
              </div>

              <Button onClick={startQuizHandler} size="lg" className="w-full">
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Quiz Taking Screen
  if (!quiz) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Quiz Not Found
          </h1>
          <Link to="/practice">
            <Button>Back to Practice</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Questions Available
          </h1>
          <p className="text-gray-600 mb-6">
            The generated quiz did not contain valid questions.
          </p>
          <Link to="/practice">
            <Button>Back to Practice</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  if (!currentQ) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Question Not Found
          </h1>
          <Link to="/practice">
            <Button>Back to Practice</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Timer and Progress */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="w-48 h-2 bg-gray-200 rounded-full">
              <Progress value={progress} />
            </div>
          </div>
        </div>

        {/* Question Card */}
        <Card key={currentQ.id ?? currentQuestionIndex} className="p-8">
          <CardHeader>
            <CardTitle className="text-xl mb-6 whitespace-pre-wrap">
              {currentQ.question}
              </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={`${currentQ.id ?? currentQuestionIndex}-${index}`}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    currentSelectedAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {currentQuestionIndex === questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} size="lg">
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentSelectedAnswer === null}
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Question Navigator
          </h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => handleGoToQuestion(index)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  currentQuestionIndex === index
                    ? 'bg-blue-600 text-white'
                    : selectedAnswers[index] !== undefined
                      ? 'bg-green-200 text-green-800'
                      : 'bg-gray-200 text-gray-600'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default QuizTaking;
