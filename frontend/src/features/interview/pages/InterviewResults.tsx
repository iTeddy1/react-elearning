import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import {
  Download,
  RefreshCw,
  BarChart3,
  MessageSquare,
  Target,
  FileText,
  TrendingUp,
  Award,
} from 'lucide-react';
import ResultsHeader from '../components/review-result/ResultsHeader';
import OverallScore from '../components/review-result/OverallScore';
import { ScoresBreakdown } from '../components/results/ScoresBreakdown';
import { CommunicationMetrics } from '../components/results/CommunicationMetrics';
import { CriticalFeedback } from '../components/results/CriticalFeedback';
import { QuestionTranscripts } from '../components/results/QuestionTranscripts';
import OverallSummary from '../components/review-result/OverallSummary';
import { useInterviewSessionStore } from '../store/interview-session-store';
import { generateInterviewPDF } from '../utils/pdf-export';

export const InterviewResults: React.FC = () => {
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = useState(false);
  const { resetSession, reviewResult, currentSession } =
    useInterviewSessionStore();

  if (!currentSession) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <Card className="border-2">
          <CardContent className="text-center space-y-4 py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              No Session Found
            </h2>
            <p className="text-gray-600">
              Please start a new interview session.
            </p>
            <Button onClick={() => void navigate('/interview/setup')} size="lg">
              Start New Interview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!reviewResult) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <Card className="border-2 border-yellow-200">
          <CardContent className="text-center space-y-4 py-12">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-yellow-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Review Not Available
            </h2>
            <p className="text-gray-600">
              Your review is still being generated or there was an error. Please
              wait a moment or try again.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={() => void navigate('/interview/setup')}
              >
                Start New Interview
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { scores, overallSummary } = reviewResult;

  // Get enhanced review data from session store
  const enhancedReview = (currentSession as any)?.enhancedReview;

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      generateInterviewPDF({
        jobRole: currentSession.jobRole || 'Interview',
        date: new Date(),
        overallScore: scores.overallInterviewScore,
        scores: enhancedReview?.scores || {
          technicalKnowledge: scores.totalRelevancyScore,
          communicationSkills: scores.communicationScore,
          problemSolving: scores.grammarScore,
          professionalism: scores.professionalismScore,
          overallFit: scores.sociabilityScore,
        },
        communicationMetrics: enhancedReview?.communicationMetrics,
        strengths:
          enhancedReview?.overallFeedback?.strengths ||
          overallSummary.strengths,
        weaknesses:
          enhancedReview?.overallFeedback?.weaknesses ||
          overallSummary.weaknesses,
        recommendations:
          enhancedReview?.overallFeedback?.recommendations ||
          overallSummary.keyInsights,
        hiringPotential: enhancedReview?.overallFeedback?.hiringPotential,
        decision: enhancedReview?.overallFeedback?.decision,
      });
      toast.success('PDF exported successfully!');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestart = () => {
    resetSession();
    void navigate('/interview/setup');
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-7xl mx-auto space-y-6 pb-12 px-4">
        <ResultsHeader />

        {/* Overall Score Card - Prominent Display */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardContent className="py-6">
            <OverallScore scores={scores} />
          </CardContent>
        </Card>

        <Separator className="my-6" />

        {/* Tabbed Content */}
        <Tabs defaultValue="scores" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="scores" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
              <span className="sm:hidden">Scores</span>
            </TabsTrigger>
            <TabsTrigger
              value="communication"
              className="flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Communication</span>
              <span className="sm:hidden">Comm</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Questions</span>
            </TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="scores" className="space-y-4 mt-6">
            <div className="grid gap-6">
              {enhancedReview?.scores ? (
                <ScoresBreakdown scores={enhancedReview.scores} />
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-center text-muted-foreground">
                      Detailed score breakdown not available
                    </p>
                  </CardContent>
                </Card>
              )}

              <OverallSummary overall={overallSummary} />
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-4 mt-6">
            {enhancedReview?.communicationMetrics ? (
              <CommunicationMetrics
                metrics={enhancedReview.communicationMetrics}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-muted-foreground">
                    Communication metrics not available for this interview
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4 mt-6">
            {enhancedReview ? (
              <CriticalFeedback
                decision={enhancedReview?.overallFeedback?.decision}
                hiringPotential={
                  enhancedReview.overallFeedback?.hiringPotential
                }
                redFlags={enhancedReview.overallFeedback?.redFlags}
                standoutMoments={
                  enhancedReview.overallFeedback?.standoutMoments
                }
                criticalConcerns={
                  enhancedReview.overallFeedback?.criticalConcerns
                }
                detailedFeedback={enhancedReview.detailedFeedback}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-muted-foreground">
                    Critical feedback not available for this interview
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-4 mt-6">
            {enhancedReview?.questionFeedback?.some(
              (qf: any) => qf.transcription
            ) ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="w-4 h-4" />
                  <span>
                    Detailed analysis for{' '}
                    {enhancedReview.questionFeedback.length} questions
                  </span>
                </div>
                <QuestionTranscripts
                  questionFeedback={enhancedReview.questionFeedback}
                  questions={currentSession.questions}
                />
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-muted-foreground">
                    Question transcripts not available for this interview
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Success Summary at Bottom */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-green-900 mb-2">
                  Congratulations on Completing Your Interview!
                </h3>
                <p className="text-green-800 text-sm mb-4">
                  You&apos;ve successfully completed the interview practice
                  session. Review your performance above and use the insights to
                  improve for your next interview.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    size="sm"
                  >
                    {isExporting ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 mr-2" />
                    )}
                    Save Report
                  </Button>
                  <Button onClick={handleRestart} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Practice Again
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};
