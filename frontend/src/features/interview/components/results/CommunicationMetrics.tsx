import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface CommunicationMetricsProps {
  metrics: {
    clarity: number;
    pace: number;
    vocabulary: number;
    grammarAccuracy: number;
    fillerWords: number;
    structuredThinking: number;
  };
}

export function CommunicationMetrics({ metrics }: CommunicationMetricsProps) {
  const getMetricColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMetricIcon = (score: number) => {
    if (score >= 70) return <TrendingUp className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const metricsList = [
    {
      label: 'Clarity',
      value: metrics.clarity,
      description: 'How clear and understandable the responses were',
    },
    {
      label: 'Speaking Pace',
      value: metrics.pace,
      description: 'Speaking speed and rhythm',
    },
    {
      label: 'Vocabulary',
      value: metrics.vocabulary,
      description: 'Word choice and technical terminology usage',
    },
    {
      label: 'Grammar Accuracy',
      value: metrics.grammarAccuracy,
      description: 'Sentence structure and grammar correctness',
    },
    {
      label: 'Filler Words',
      value: metrics.fillerWords,
      description: 'Use of "um", "uh", "like", etc. (lower is better)',
      inverse: true,
    },
    {
      label: 'Structured Thinking',
      value: metrics.structuredThinking,
      description: 'Logical flow and organization of thoughts',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Communication Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {metricsList.map((metric) => (
          <div
            key={metric.label}
            className={`p-3 rounded-lg border ${getMetricColor(metric.value)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {getMetricIcon(metric.value)}
                <span className="font-medium">{metric.label}</span>
              </div>
              <Badge variant="secondary" className="font-bold">
                {metric.value}%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
            <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-current transition-all duration-500"
                style={{ width: `${metric.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
