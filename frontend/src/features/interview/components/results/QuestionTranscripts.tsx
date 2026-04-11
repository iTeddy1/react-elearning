import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileText } from 'lucide-react';

interface QuestionTranscriptProps {
  questionFeedback: Array<{
    questionId: string;
    score: number;
    feedback: string;
    transcription?: string;
    detailedScores?: {
      technicalAccuracy: number;
      relevance: number;
      completeness: number;
      clarity: number;
    };
    strengths?: string[];
    weaknesses?: string[];
    criticalPoints?: string[];
    improvementAreas?: string[];
  }>;
  questions: Array<{ id: string; question: string }>;
}

export function QuestionTranscripts({
  questionFeedback,
  questions,
}: QuestionTranscriptProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500 text-white';
    if (score >= 60) return 'bg-yellow-500 text-white';
    return 'bg-red-500 text-white';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <Accordion type="multiple" className="space-y-4">
      {questionFeedback
        .filter((qf) => qf.transcription)
        .map((qf, idx) => {
          const question = questions.find((q) => q.id === qf.questionId);
          return (
            <AccordionItem
              key={qf.questionId}
              value={qf.questionId}
              className="border rounded-lg"
            >
              <Card className="border-0">
                <CardHeader className="pb-0">
                  <AccordionTrigger className="hover:no-underline">
                    <CardTitle className="flex items-center justify-between w-full text-base pr-4">
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Question {idx + 1}
                      </span>
                      <Badge className={getScoreColor(qf.score)}>
                        {qf.score}%
                      </Badge>
                    </CardTitle>
                  </AccordionTrigger>
                </CardHeader>

                <AccordionContent>
                  <CardContent className="space-y-4 pt-4">
                    {/* Question Text */}
                    <div
                      className={`p-3 rounded-lg border ${getScoreBgColor(qf.score)}`}
                    >
                      <p className="font-medium text-sm text-gray-700">
                        {question?.question}
                      </p>
                    </div>

                    {/* Transcription */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        Your Response:
                      </h4>
                      <p className="text-sm leading-relaxed p-3 bg-blue-50 border border-blue-200 rounded">
                        {qf.transcription}
                      </p>
                    </div>

                    {/* Detailed Scores */}
                    {qf.detailedScores && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">
                            Technical Accuracy
                          </div>
                          <div className="font-bold text-lg">
                            {qf.detailedScores.technicalAccuracy}%
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">
                            Relevance
                          </div>
                          <div className="font-bold text-lg">
                            {qf.detailedScores.relevance}%
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">
                            Completeness
                          </div>
                          <div className="font-bold text-lg">
                            {qf.detailedScores.completeness}%
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">
                            Clarity
                          </div>
                          <div className="font-bold text-lg">
                            {qf.detailedScores.clarity}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Strengths */}
                    {qf.strengths && qf.strengths.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-green-700">
                          Strengths:
                        </h4>
                        <ul className="space-y-1">
                          {qf.strengths.map((strength, i) => (
                            <li
                              key={i}
                              className="text-sm flex items-start gap-2 text-green-800"
                            >
                              <span className="text-green-600">✓</span>
                              {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {qf.weaknesses && qf.weaknesses.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-orange-700">
                          Areas for Improvement:
                        </h4>
                        <ul className="space-y-1">
                          {qf.weaknesses.map((weakness, i) => (
                            <li
                              key={i}
                              className="text-sm flex items-start gap-2 text-orange-800"
                            >
                              <span className="text-orange-600">⚠</span>
                              {weakness}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Critical Points */}
                    {qf.criticalPoints && qf.criticalPoints.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-purple-700">
                          Key Observations:
                        </h4>
                        <ul className="space-y-1">
                          {qf.criticalPoints.map((point, i) => (
                            <li
                              key={i}
                              className="text-sm flex items-start gap-2 text-purple-800"
                            >
                              <span className="text-purple-600">→</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvement Areas */}
                    {qf.improvementAreas && qf.improvementAreas.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-blue-700">
                          Improvement Suggestions:
                        </h4>
                        <ul className="space-y-1">
                          {qf.improvementAreas.map((area, i) => (
                            <li
                              key={i}
                              className="text-sm flex items-start gap-2 text-blue-800"
                            >
                              <span className="text-blue-600">💡</span>
                              {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Overall Feedback */}
                    <div className="pt-3 border-t">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">
                        Overall Feedback:
                      </h4>
                      <p className="text-sm leading-relaxed">{qf.feedback}</p>
                    </div>
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
    </Accordion>
  );
}
