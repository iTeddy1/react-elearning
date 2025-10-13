import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionEvaluation } from '../../types';
import { Badge } from '@/components/ui/badge';
import { getReviewScoreColor } from '../../utils/get-review-score-color';
import { cn } from '@/lib/utils';

export default function QuestionAnalysis({
  relevancyScoreBreakdown,
}: {
  relevancyScoreBreakdown: QuestionEvaluation[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {relevancyScoreBreakdown.map((item, index) => (
            <div
              key={index}
              className="border-l-4 border-blue-200 pl-4 space-y-2"
            >
              <div className="flex items-start justify-between">
                <h4 className="font-medium text-sm">{item.question}</h4>
                <Badge
                  className={cn(
                    'bg-neutral-100',
                    getReviewScoreColor(item.relevancy_score)
                  )}
                >
                  {item.relevancy_score}%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.reason}</p>
              {item.strengths.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-green-700">
                    Strengths:
                  </p>
                  <ul className="text-sm text-green-600 ml-4">
                    {item.strengths.map((strength, i) => (
                      <li key={i}>• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              {item.improvements.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    Areas for Improvement:
                  </p>
                  <ul className="text-sm text-orange-600 ml-4">
                    {item.improvements.map((improvement, i) => (
                      <li key={i}>• {improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
