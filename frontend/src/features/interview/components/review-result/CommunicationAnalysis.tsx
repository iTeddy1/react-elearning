import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getReviewScoreColor } from '../../utils/get-review-score-color';
import { CommunicationBreakdown } from '../../types';

export default function CommunicationAnalysis({
  communicationBreakdown,
}: {
  communicationBreakdown: CommunicationBreakdown[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {communicationBreakdown.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{item.name}</span>
                <span
                  className={`font-semibold ${getReviewScoreColor(item.score)}`}
                >
                  {item.score}%
                </span>
              </div>
              <Progress value={item.score} className="h-2" />
              <p className="text-sm text-muted-foreground">{item.reasoning}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
