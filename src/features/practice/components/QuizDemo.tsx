import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useQuizGeneratorStore,
  useQuizSessionStore,
  useQuizSessionSelectors,
  useProgressSelectors,
  useQuizStore,
} from '../store';

const QuizDemo = () => {
  const [currentView, setCurrentView] = useState<
    'generator' | 'session' | 'results' | 'progress'
  >('generator');

  // Generator store
  const {
    isGenerating,
    generatedQuiz,
    generationError,
    startGeneration,
    resetGeneration,
  } = useQuizGeneratorStore();

  // Session store
  const {
    submitAnswer,
    nextQuestion,
    previousQuestion,
    currentScore,
    showResults,
  } = useQuizSessionStore();

  // Session selectors
  const {
    currentQuestion,
    currentQuiz,
    progress,
    answeredQuestions,
    totalQuestions,
    isLastQuestion,
    isFirstQuestion,
    canNavigate,
  } = useQuizSessionSelectors();

  // Progress selectors
  const { overallStats, accuracy } = useProgressSelectors();

  // Coordinator
  const { startQuizFlow, completeQuizSession } = useQuizStore();

  // Timer for quiz session
  useEffect(() => {
    if (currentQuiz && !showResults) {
      const timer = setInterval(() => {
        // Update timer logic here if needed
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentQuiz, showResults]);

  const handleGenerateQuiz = async () => {
    const settings = {
      topic: 'React',
      difficulty: 'advanced' as 'Beginner' | 'Intermediate' | 'Advanced',
      questionCount: 1,
      language: 'en' as 'en' | 'vi',
    };

    try {
      await startGeneration(settings);
      setCurrentView('session');
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const handleStartQuiz = () => {
    if (generatedQuiz) {
      startQuizFlow(generatedQuiz);
      setCurrentView('session');
    }
  };

  const handleAnswerSubmit = (selectedOption: number) => {
    if (currentQuestion) {
      submitAnswer(currentQuestion.id, selectedOption);

      if (isLastQuestion) {
        completeQuizSession();
        setCurrentView('results');
      } else {
        nextQuestion();
      }
    }
  };

  const handleBackToGenerator = () => {
    resetGeneration();
    setCurrentView('generator');
  };

  // Generator View
  if (currentView === 'generator') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Quiz Generator Demo</CardTitle>
            <CardDescription>
              Generate a quiz using AI and test the complete flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGenerateQuiz}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating
                ? 'Generating Quiz...'
                : 'Generate React Quiz (Advanced)'}
            </Button>

            {generationError && (
              <div className="text-red-600 p-4 bg-red-50 rounded">
                Error: {generationError}
              </div>
            )}

            {generatedQuiz && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {generatedQuiz.title}
                  </CardTitle>
                  <CardDescription>{generatedQuiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Badge variant="outline">{generatedQuiz.difficulty}</Badge>
                    <Badge variant="outline">
                      {generatedQuiz.questions.length} questions
                    </Badge>
                    <Badge variant="outline">
                      {generatedQuiz.timeLimit} min
                    </Badge>
                  </div>
                  <Button onClick={handleStartQuiz}>Start Quiz</Button>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Progress Stats */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold">
                  {overallStats.totalQuizzesCompleted}
                </div>
                <div className="text-sm text-gray-600">Quizzes Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {overallStats.averageScore}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {overallStats.streakCount}
                </div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Session View
  if (currentView === 'session' && currentQuestion && !showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>
                Question{' '}
                {currentQuiz
                  ? currentQuiz.questions.findIndex(
                      (q) => q.id === currentQuestion.id
                    ) + 1
                  : 1}{' '}
                of {totalQuestions}
              </span>
              <Badge variant="outline">{progress}% Complete</Badge>
            </CardTitle>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">
                {currentQuestion.question}
              </h3>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSubmit(index)}
                    className="w-full p-4 text-left border rounded-lg hover:bg-gray-50 focus:bg-blue-50 focus:border-blue-500"
                  >
                    <span className="font-medium mr-2">{'ABCD'[index]}.</span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={isFirstQuestion || !canNavigate}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={nextQuestion}
                disabled={isLastQuestion || !canNavigate}
              >
                {isLastQuestion ? 'Finish' : 'Next'}
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              Answered: {answeredQuestions} / {totalQuestions}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results View
  if (currentView === 'results' || showResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Complete!</CardTitle>
            <CardDescription>Here are your results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{currentScore}%</div>
              <div className="text-lg text-gray-600">Your Score</div>
            </div>

            {currentQuiz?.aiOverall && (
              <div>
                <h4 className="font-medium mb-2">AI Analysis</h4>
                <p className="text-gray-700 mb-4">
                  {currentQuiz.aiOverall.summary}
                </p>

                {currentQuiz.aiOverall.suggestedTopics.length > 0 && (
                  <div>
                    <h5 className="font-medium mb-2">
                      Suggested Topics for Study:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {currentQuiz.aiOverall.suggestedTopics.map(
                        (topic, index) => (
                          <Badge key={index} variant="outline">
                            {topic}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={handleBackToGenerator}>
                Generate Another Quiz
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentView('progress')}
              >
                View Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default QuizDemo;
