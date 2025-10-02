import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/layout';
import { getQuizById } from '@/data/practice-data';
import { useQuizSessionStore } from '../store/quiz-session-store';
import { useQuizGeneratorStore } from '../store/quiz-generator-store';
import {
  useQuizReviewStore,
  convertSessionToReviewInput,
} from '../store/quiz-review-store';
import QuizReviewDisplay from '../components/quiz-review-display';

const QuizTaking = () => {
  const { quizId } = useParams<{ quizId: string }>();

  // Try to get quiz from session store first (for AI-generated quizzes)
  const {
    currentQuiz,
    currentQuestionIndex,
    answers,
    isQuizActive,
    showResults,
    currentScore,
    startQuiz,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    showQuizResults,
    resetQuiz,
  } = useQuizSessionStore();

  // Get generated quiz from generator store
  const { generatedQuiz } = useQuizGeneratorStore();

  // Quiz review state and actions
  const { generateReview, clearReview } = useQuizReviewStore();

  // Fallback to mock data for existing quizzes
  const mockQuiz = getQuizById(Number(quizId));

  // Determine which quiz to use
  const quiz = currentQuiz || generatedQuiz || mockQuiz;

  const [quizStarted, setQuizStarted] = useState(isQuizActive);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});
  const [showReview, setShowReview] = useState(false);

  // Initialize quiz if we have a generated quiz but no active session
  useEffect(() => {
    if (generatedQuiz && !currentQuiz && !isQuizActive) {
      startQuiz(generatedQuiz);
      setQuizStarted(true);
    }
  }, [generatedQuiz, currentQuiz, isQuizActive, startQuiz]);

  // Sync answers with session store
  useEffect(() => {
    const sessionAnswers: Record<number, number> = {};
    answers.forEach((answer) => {
      sessionAnswers[answer.questionId - 1] = answer.selectedOption; // Convert to 0-based index
    });
    setSelectedAnswers(sessionAnswers);
  }, [answers]);

  const startQuizHandler = () => {
    if (!quiz) return;
    if (!currentQuiz) {
      startQuiz(quiz);
    }
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!quiz) return;

    const questionId = quiz.questions[currentQuestionIndex].id;

    // Update local state
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: answerIndex,
    });

    // Update session store
    submitAnswer(questionId, answerIndex);
  };

  const handleNext = () => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length - 1) return;
    nextQuestion();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      previousQuestion();
    }
  };

  const handleSubmitQuiz = () => {
    showQuizResults();
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    if (showResults && currentScore > 0) {
      return currentScore;
    }

    const correctAnswers = quiz.questions.filter(
      (question, index) => selectedAnswers[index] === question.correctAnswer
    ).length;
    return Math.round((correctAnswers / quiz.questions.length) * 100);
  };

  const handleGenerateReview = async () => {
    if (!quiz || !answers.length) return;

    try {
      setShowReview(true);
      clearReview(); // Clear any previous review

      // Debug logging to check the data being sent
      console.log('Quiz data:', quiz);
      console.log('Session answers:', answers);
      console.log('Selected answers (local state):', selectedAnswers);

      const { quizPayload, userAnswers } = convertSessionToReviewInput(
        quiz,
        answers
      );
      
      console.log('Quiz payload:', JSON.parse(quizPayload));
      console.log('User answers for AI:', userAnswers);
      
      // Calculate expected score locally for verification
      const correctCount = answers.filter(a => a.isCorrect).length;
      console.log('Expected score:', correctCount, '/', quiz.questions.length);
      
      await generateReview(quizPayload, userAnswers, quiz.id || 0, 'en');
    } catch (error) {
      console.error('Failed to generate review:', error);
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
    const correctAnswers = quiz.questions.filter(
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
                You answered {correctAnswers} out of {quiz.questions.length}{' '}
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
            {quiz.questions.map((question, index) => {
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
              <p className="text-gray-600 mb-6">{quiz.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {quiz.questions.length}
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

  const currentQ = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header with Timer and Progress */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <div className="w-48 h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          {/* <div className="flex items-center space-x-2 text-orange-600">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div> */}
        </div>

        {/* Question Card */}
        <Card className="p-8">
          <CardHeader>
            <CardTitle className="text-xl mb-6">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
                    selectedAnswers[currentQuestionIndex] === index
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
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmitQuiz} size="lg">
                Submit Quiz
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuestionIndex] === undefined}
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
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToQuestion(index)}
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
