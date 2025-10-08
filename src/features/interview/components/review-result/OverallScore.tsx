import { TrendingUp } from 'lucide-react';
import { ScoreBreakdown } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getReviewScoreColor } from '../../utils/get-review-score-color';

export default function OverallScore({ scores }: { scores: ScoreBreakdown }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Overall Scores
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getReviewScoreColor(scores.overallInterviewScore)}`}
            >
              {scores.overallInterviewScore}%
            </div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </div>
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getReviewScoreColor(scores.communicationScore)}`}
            >
              {scores.communicationScore}%
            </div>
            <div className="text-sm text-muted-foreground">Communication</div>
          </div>
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getReviewScoreColor(scores.grammarScore)}`}
            >
              {scores.grammarScore}%
            </div>
            <div className="text-sm text-muted-foreground">Grammar</div>
          </div>
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getReviewScoreColor(scores.totalRelevancyScore)}`}
            >
              {scores.totalRelevancyScore}%
            </div>
            <div className="text-sm text-muted-foreground">Relevancy</div>
          </div>
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getReviewScoreColor(scores.professionalismScore)}`}
            >
              {scores.professionalismScore}%
            </div>
            <div className="text-sm text-muted-foreground">Professionalism</div>
          </div>
          <div className="text-center">
            <div
              className={`text-3xl font-bold ${getReviewScoreColor(scores.energyLevelScore)}`}
            >
              {scores.energyLevelScore}%
            </div>
            <div className="text-sm text-muted-foreground">Energy Level</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
