import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ScoresBreakdownProps {
  scores: {
    technicalKnowledge: number;
    communicationSkills: number;
    problemSolving: number;
    professionalism: number;
    overallFit: number;
    confidence?: number;
    articulation?: number;
    responseDepth?: number;
  };
}

export function ScoresBreakdown({ scores }: ScoresBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const coreScores = [
    { label: 'Technical Knowledge', value: scores.technicalKnowledge },
    { label: 'Communication Skills', value: scores.communicationSkills },
    { label: 'Problem Solving', value: scores.problemSolving },
    { label: 'Professionalism', value: scores.professionalism },
    { label: 'Overall Fit', value: scores.overallFit },
  ];

  const additionalScores = [
    { label: 'Confidence', value: scores.confidence },
    { label: 'Articulation', value: scores.articulation },
    { label: 'Response Depth', value: scores.responseDepth },
  ].filter((s) => s.value !== undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Scores */}
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Core Competencies
          </h3>
          {coreScores.map((score) => (
            <div key={score.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{score.label}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getScoreBadge(score.value)}</Badge>
                  <span className="text-sm font-bold">{score.value}%</span>
                </div>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getScoreColor(score.value)} transition-all duration-500`}
                  style={{ width: `${score.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Additional Scores */}
        {additionalScores.length > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-sm text-muted-foreground">
              Additional Metrics
            </h3>
            {additionalScores.map((score) => (
              <div key={score.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{score.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {getScoreBadge(score.value!)}
                    </Badge>
                    <span className="text-sm font-bold">{score.value}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getScoreColor(score.value!)} transition-all duration-500`}
                    style={{ width: `${score.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
