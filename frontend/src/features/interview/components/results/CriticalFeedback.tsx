import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Star, Flag, Target } from 'lucide-react';

interface CriticalFeedbackProps {
  decision?: 'RECOMMEND' | 'MAYBE' | 'NOT_RECOMMEND';
  hiringPotential?: string;
  redFlags?: string[];
  standoutMoments?: string[];
  criticalConcerns?: string[];
  detailedFeedback?: string;
}

export function CriticalFeedback({
  decision,
  hiringPotential,
  redFlags = [],
  standoutMoments = [],
  criticalConcerns = [],
  detailedFeedback,
}: CriticalFeedbackProps) {
  const getDecisionStyle = (decision?: string) => {
    switch (decision) {
      case 'RECOMMEND':
        return 'bg-green-500 text-white';
      case 'MAYBE':
        return 'bg-yellow-500 text-white';
      case 'NOT_RECOMMEND':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getDecisionText = (decision?: string) => {
    switch (decision) {
      case 'RECOMMEND':
        return 'Strong Recommendation';
      case 'MAYBE':
        return 'Conditional Recommendation';
      case 'NOT_RECOMMEND':
        return 'Not Recommended';
      default:
        return 'Under Review';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Critical Evaluation
          </span>
          {decision && (
            <Badge className={getDecisionStyle(decision)}>
              {getDecisionText(decision)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {detailedFeedback && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-600" />
              Detailed Feedback
            </h3>
            <p className="text-sm text-gray-800">{detailedFeedback}</p>
          </div>
        )}

        {/* Hiring Potential */}
        {hiringPotential && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Hiring Potential
            </h3>
            <p className="text-sm text-blue-800">{hiringPotential}</p>
          </div>
        )}

        {/* Standout Moments */}
        {standoutMoments.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-green-900 flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-600" />
              Standout Moments
            </h3>
            <ul className="space-y-2">
              {standoutMoments.map((moment, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm p-3 bg-green-50 border border-green-200 rounded"
                >
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-green-800">{moment}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Red Flags */}
        {redFlags.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-orange-900 flex items-center gap-2">
              <Flag className="w-4 h-4 text-orange-600" />
              Red Flags
            </h3>
            <ul className="space-y-2">
              {redFlags.map((flag, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm p-3 bg-orange-50 border border-orange-200 rounded"
                >
                  <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-orange-800">{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Critical Concerns */}
        {criticalConcerns.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              Critical Concerns
            </h3>
            <ul className="space-y-2">
              {criticalConcerns.map((concern, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm p-3 bg-red-50 border border-red-200 rounded"
                >
                  <span className="text-red-600 font-bold">⚠</span>
                  <span className="text-red-800">{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
