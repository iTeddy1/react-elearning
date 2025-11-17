import React from 'react';
import { Clock, Star, TrendingUp, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { QuestionMetadata } from '../types';

interface QuestionCardProps {
  question: QuestionMetadata;
  isActive: boolean;
  onClick: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isActive,
  onClick,
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'hard':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getImportanceIcon = (importance?: string) => {
    if (importance === 'high') {
      return <Star className="w-3 h-3 text-red-500 fill-red-500" />;
    }
    return null;
  };

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <button
          onClick={onClick}
          className={`w-full text-left p-3 rounded-lg transition-all group ${
            isActive
              ? 'bg-blue-50 border-l-4 border-blue-600 shadow-sm'
              : 'hover:bg-gray-50 border-l-4 border-transparent hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-2">
            {/* Importance Indicator */}
            <div className="mt-1 flex-shrink-0">
              {getImportanceIcon(question.metadata?.importance)}
              {!question.metadata?.importance && (
                <div className="w-3 h-3" /> // Spacer
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm leading-snug line-clamp-2 text-gray-900 group-hover:text-blue-600">
                {question.title}
              </div>

              {/* Metadata Badges */}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {question.metadata?.difficulty && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${getDifficultyColor(question.metadata.difficulty)}`}
                  >
                    {question.metadata.difficulty}
                  </Badge>
                )}

                {question.metadata?.duration && (
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {question.metadata.duration}m
                  </Badge>
                )}

                {question.metadata?.featured && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-yellow-100 text-yellow-700"
                  >
                    <Award className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </button>
      </HoverCardTrigger>

      <HoverCardContent side="right" align="start" className="w-80 p-4">
        <div className="space-y-3">
          {/* Title */}
          <h4 className="font-semibold text-gray-900 leading-snug">
            {question.title}
          </h4>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {question.metadata?.difficulty && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Difficulty:</span>
                <Badge
                  variant="outline"
                  className={getDifficultyColor(question.metadata.difficulty)}
                >
                  {question.metadata.difficulty}
                </Badge>
              </div>
            )}

            {question.metadata?.importance && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Importance:</span>
                <Badge
                  variant="outline"
                  className={
                    question.metadata.importance === 'high'
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : question.metadata.importance === 'medium'
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                  }
                >
                  {question.metadata.importance}
                </Badge>
              </div>
            )}

            {question.metadata?.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {question.metadata.duration} min
                </span>
              </div>
            )}

            {question.metadata?.ranking !== undefined && (
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  Rank: {question.metadata.ranking}
                </span>
              </div>
            )}
          </div>

          {/* Topics */}
          {question.metadata?.topics && question.metadata.topics.length > 0 && (
            <div>
              <div className="text-xs text-gray-500 mb-2">Topics:</div>
              <div className="flex flex-wrap gap-1">
                {question.metadata.topics.map((topic) => (
                  <Badge
                    key={topic}
                    variant="secondary"
                    className="text-xs capitalize"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Level */}
          {question.metadata?.level && (
            <div className="text-xs text-gray-500">
              Level:{' '}
              <span className="text-gray-700 capitalize">
                {question.metadata.level}
              </span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
