import { CheckCircle, Clock, TrendingUp, User } from 'lucide-react';
import { OverallSummary as IOverallSummary } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const getRecommendationColor = (recommendation: string) => {
  if (recommendation.includes('YES')) return 'bg-green-100 text-green-800';
  if (recommendation.includes('MAYBE')) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

export default function OverallSummary({
  overall,
}: {
  overall: IOverallSummary;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Summary & Recommendation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge className={getRecommendationColor(overall.recommendation)}>
            {overall.recommendation}
          </Badge>
        </div>

        <div>
          <h4 className="font-medium mb-2">Overall Assessment:</h4>
          <p className="text-sm text-muted-foreground">
            {overall.overallSummary}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-green-700">Strengths:</h4>
            <ul className="text-sm space-y-1">
              {overall.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-orange-700">
              Areas for Development:
            </h4>
            <ul className="text-sm space-y-1">
              {overall.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Key Insights:</h4>
          <ul className="text-sm space-y-1">
            {overall.keyInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
