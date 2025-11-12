import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterOptions } from '../types';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  availableTopics: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  availableTopics,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['topics'])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleTopicToggle = (topic: string) => {
    const newTopics = filters.topics.includes(topic)
      ? filters.topics.filter((t) => t !== topic)
      : [...filters.topics, topic];
    onFilterChange({ ...filters, topics: newTopics });
  };

  const handleImportanceToggle = (
    importance: 'low' | 'medium' | 'high'
  ) => {
    const newImportance = filters.importance.includes(importance)
      ? filters.importance.filter((i) => i !== importance)
      : [...filters.importance, importance];
    onFilterChange({ ...filters, importance: newImportance });
  };

  const handleDifficultyToggle = (
    difficulty: 'easy' | 'medium' | 'hard'
  ) => {
    const newDifficulty = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter((d) => d !== difficulty)
      : [...filters.difficulty, difficulty];
    onFilterChange({ ...filters, difficulty: newDifficulty });
  };

  const handleRankingChange = (value: number[]) => {
    onFilterChange({ ...filters, rankingRange: [value[0], value[1]] });
  };

  const clearAllFilters = () => {
    onFilterChange({
      topics: [],
      importance: [],
      difficulty: [],
      rankingRange: [0, 100],
    });
  };

  const activeFilterCount =
    filters.topics.length +
    filters.importance.length +
    filters.difficulty.length +
    (filters.rankingRange[0] !== 0 || filters.rankingRange[1] !== 100 ? 1 : 0);

  const ImportanceBadge = ({ level }: { level: 'low' | 'medium' | 'high' }) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-red-100 text-red-700',
    };
    return (
      <Badge variant="secondary" className={colors[level]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const DifficultyBadge = ({ level }: { level: 'easy' | 'medium' | 'hard' }) => {
    const colors = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-orange-100 text-orange-700',
      hard: 'bg-red-100 text-red-700',
    };
    return (
      <Badge variant="secondary" className={colors[level]}>
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="border-b bg-white">
      {/* Filter Toggle Button */}
      <div className="p-3 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-1">
              {activeFilterCount}
            </Badge>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="border-t">
          <ScrollArea className="h-96">
            <div className="p-4 space-y-4">
              {/* Topics Filter */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleSection('topics')}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-900"
                >
                  <span>Topics ({filters.topics.length} selected)</span>
                  {expandedSections.has('topics') ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.has('topics') && (
                  <div className="space-y-2 pl-2">
                    {availableTopics.map((topic) => (
                      <div
                        key={topic}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`topic-${topic}`}
                          checked={filters.topics.includes(topic)}
                          onCheckedChange={() => handleTopicToggle(topic)}
                        />
                        <label
                          htmlFor={`topic-${topic}`}
                          className="text-sm text-gray-700 cursor-pointer capitalize"
                        >
                          {topic}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Importance Filter */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleSection('importance')}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-900"
                >
                  <span>
                    Importance ({filters.importance.length} selected)
                  </span>
                  {expandedSections.has('importance') ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.has('importance') && (
                  <div className="space-y-2 pl-2">
                    {(['low', 'medium', 'high'] as const).map((importance) => (
                      <div
                        key={importance}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`importance-${importance}`}
                            checked={filters.importance.includes(importance)}
                            onCheckedChange={() =>
                              handleImportanceToggle(importance)
                            }
                          />
                          <label
                            htmlFor={`importance-${importance}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {importance.charAt(0).toUpperCase() +
                              importance.slice(1)}
                          </label>
                        </div>
                        <ImportanceBadge level={importance} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleSection('difficulty')}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-900"
                >
                  <span>
                    Difficulty ({filters.difficulty.length} selected)
                  </span>
                  {expandedSections.has('difficulty') ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.has('difficulty') && (
                  <div className="space-y-2 pl-2">
                    {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                      <div
                        key={difficulty}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`difficulty-${difficulty}`}
                            checked={filters.difficulty.includes(difficulty)}
                            onCheckedChange={() =>
                              handleDifficultyToggle(difficulty)
                            }
                          />
                          <label
                            htmlFor={`difficulty-${difficulty}`}
                            className="text-sm text-gray-700 cursor-pointer"
                          >
                            {difficulty.charAt(0).toUpperCase() +
                              difficulty.slice(1)}
                          </label>
                        </div>
                        <DifficultyBadge level={difficulty} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ranking Range Filter */}
              <div className="space-y-2">
                <button
                  onClick={() => toggleSection('ranking')}
                  className="flex items-center justify-between w-full text-sm font-semibold text-gray-900"
                >
                  <span>
                    Ranking: {filters.rankingRange[0]} - {filters.rankingRange[1]}
                  </span>
                  {expandedSections.has('ranking') ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {expandedSections.has('ranking') && (
                  <div className="space-y-3 pl-2 pr-2">
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={filters.rankingRange}
                      onValueChange={handleRankingChange}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Min: {filters.rankingRange[0]}</span>
                      <span>Max: {filters.rankingRange[1]}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
