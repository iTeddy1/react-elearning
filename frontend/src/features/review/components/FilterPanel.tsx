import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FilterOptions } from '../types';
import { cn } from '@/lib/utils';

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
  const [openPopovers, setOpenPopovers] = useState<Set<string>>(new Set());

  const togglePopover = (section: string, isOpen: boolean) => {
    const newPopovers = new Set(openPopovers);
    if (isOpen) {
      newPopovers.add(section);
    } else {
      newPopovers.delete(section);
    }
    setOpenPopovers(newPopovers);
  };

  const handleTopicToggle = (topic: string) => {
    const newTopics = filters.topics.includes(topic)
      ? filters.topics.filter((t) => t !== topic)
      : [...filters.topics, topic];
    onFilterChange({ ...filters, topics: newTopics });
  };

  const handleImportanceToggle = (importance: 'low' | 'medium' | 'high') => {
    const newImportance = filters.importance.includes(importance)
      ? filters.importance.filter((i) => i !== importance)
      : [...filters.importance, importance];
    onFilterChange({ ...filters, importance: newImportance });
  };

  const handleDifficultyToggle = (difficulty: 'easy' | 'medium' | 'hard') => {
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

  const ImportanceBadge = ({
    level,
    isSelected,
  }: {
    level: 'low' | 'medium' | 'high';
    isSelected?: boolean;
  }) => {
    const colors = {
      low: isSelected
        ? 'bg-gray-200 text-gray-900 border-gray-400'
        : 'bg-gray-50 text-gray-600 border-gray-200',
      medium: isSelected
        ? 'bg-yellow-200 text-yellow-900 border-yellow-400'
        : 'bg-yellow-50 text-yellow-700 border-yellow-200',
      high: isSelected
        ? 'bg-red-200 text-red-900 border-red-400'
        : 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <Badge
        variant="outline"
        className={cn('transition-all duration-200', colors[level])}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  const DifficultyBadge = ({
    level,
    isSelected,
  }: {
    level: 'easy' | 'medium' | 'hard';
    isSelected?: boolean;
  }) => {
    const colors = {
      easy: isSelected
        ? 'bg-green-200 text-green-900 border-green-400'
        : 'bg-green-50 text-green-700 border-green-200',
      medium: isSelected
        ? 'bg-orange-200 text-orange-900 border-orange-400'
        : 'bg-orange-50 text-orange-700 border-orange-200',
      hard: isSelected
        ? 'bg-red-200 text-red-900 border-red-400'
        : 'bg-red-50 text-red-700 border-red-200',
    };
    return (
      <Badge
        variant="outline"
        className={cn('transition-all duration-200', colors[level])}
      >
        {level.charAt(0).toUpperCase() + level.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="border-b bg-gradient-to-r from-gray-50 to-white shadow-sm">
      {/* Filter Toggle Button */}
      <div className="p-3 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'gap-2 transition-all duration-200 hover:shadow-md',
            isExpanded && 'bg-primary/5 border-primary/30'
          )}
        >
          <Filter
            className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )}
          />
          <span className="font-semibold">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-1 bg-primary animate-pulse">
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
            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white animate-in slide-in-from-top-2 duration-300">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Topics Filter */}
              <Popover onOpenChange={(open) => togglePopover('topics', open)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:border-blue-300 transition-all duration-200 bg-gradient-to-br from-blue-50/30 to-transparent"
                  >
                    <div className="flex items-center gap-2 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <span className="font-semibold text-sm">Topics</span>
                      </div>
                      {filters.topics.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 text-xs"
                        >
                          {filters.topics.length}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-left">
                      {filters.topics.length === 0
                        ? 'Select topics...'
                        : filters.topics.slice(0, 2).join(', ') +
                          (filters.topics.length > 2 ? '...' : '')}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-transparent">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Select Topics
                    </h4>
                  </div>
                  <ScrollArea className="h-64">
                    <div className="p-4 space-y-2">
                      {availableTopics.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                          No topics available
                        </p>
                      ) : (
                        availableTopics.map((topic) => (
                          <div
                            key={topic}
                            className="flex items-center space-x-2 p-2 rounded hover:bg-blue-50 transition-colors duration-150"
                          >
                            <Checkbox
                              id={`topic-${topic}`}
                              checked={filters.topics.includes(topic)}
                              onCheckedChange={() => handleTopicToggle(topic)}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <label
                              htmlFor={`topic-${topic}`}
                              className="text-sm text-gray-700 cursor-pointer capitalize flex-1 font-medium"
                            >
                              {topic}
                            </label>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Importance Filter */}
              <Popover
                onOpenChange={(open) => togglePopover('importance', open)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:border-yellow-300 transition-all duration-200 bg-gradient-to-br from-yellow-50/30 to-transparent"
                  >
                    <div className="flex items-center gap-2 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⭐</span>
                        <span className="font-semibold text-sm">
                          Importance
                        </span>
                      </div>
                      {filters.importance.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-700 text-xs"
                        >
                          {filters.importance.length}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-left">
                      {filters.importance.length === 0
                        ? 'Select importance...'
                        : filters.importance
                            .map((i) => i.charAt(0).toUpperCase() + i.slice(1))
                            .join(', ')}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-4 border-b bg-gradient-to-r from-yellow-50 to-transparent">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-lg">⭐</span>
                      Select Importance
                    </h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {(['low', 'medium', 'high'] as const).map((importance) => (
                      <div
                        key={importance}
                        className="flex items-center justify-between p-2 rounded hover:bg-yellow-50 transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <Checkbox
                            id={`importance-${importance}`}
                            checked={filters.importance.includes(importance)}
                            onCheckedChange={() =>
                              handleImportanceToggle(importance)
                            }
                            className="data-[state=checked]:bg-yellow-600"
                          />
                          <label
                            htmlFor={`importance-${importance}`}
                            className="text-sm text-gray-700 cursor-pointer font-medium flex-1"
                          >
                            {importance.charAt(0).toUpperCase() +
                              importance.slice(1)}
                          </label>
                        </div>
                        <ImportanceBadge
                          level={importance}
                          isSelected={filters.importance.includes(importance)}
                        />
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Difficulty Filter */}
              <Popover
                onOpenChange={(open) => togglePopover('difficulty', open)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:border-green-300 transition-all duration-200 bg-gradient-to-br from-green-50/30 to-transparent"
                  >
                    <div className="flex items-center gap-2 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        <span className="font-semibold text-sm">
                          Difficulty
                        </span>
                      </div>
                      {filters.difficulty.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 text-xs"
                        >
                          {filters.difficulty.length}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-left">
                      {filters.difficulty.length === 0
                        ? 'Select difficulty...'
                        : filters.difficulty
                            .map((d) => d.charAt(0).toUpperCase() + d.slice(1))
                            .join(', ')}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-4 border-b bg-gradient-to-r from-green-50 to-transparent">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-lg">🎯</span>
                      Select Difficulty
                    </h4>
                  </div>
                  <div className="p-4 space-y-2">
                    {(['easy', 'medium', 'hard'] as const).map((difficulty) => (
                      <div
                        key={difficulty}
                        className="flex items-center justify-between p-2 rounded hover:bg-green-50 transition-colors duration-150"
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <Checkbox
                            id={`difficulty-${difficulty}`}
                            checked={filters.difficulty.includes(difficulty)}
                            onCheckedChange={() =>
                              handleDifficultyToggle(difficulty)
                            }
                            className="data-[state=checked]:bg-green-600"
                          />
                          <label
                            htmlFor={`difficulty-${difficulty}`}
                            className="text-sm text-gray-700 cursor-pointer font-medium flex-1"
                          >
                            {difficulty.charAt(0).toUpperCase() +
                              difficulty.slice(1)}
                          </label>
                        </div>
                        <DifficultyBadge
                          level={difficulty}
                          isSelected={filters.difficulty.includes(difficulty)}
                        />
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Ranking Range Filter */}
              <Popover onOpenChange={(open) => togglePopover('ranking', open)}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:border-purple-300 transition-all duration-200 bg-gradient-to-br from-purple-50/30 to-transparent"
                  >
                    <div className="flex items-center gap-2 w-full justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📊</span>
                        <span className="font-semibold text-sm">Ranking</span>
                      </div>
                      {(filters.rankingRange[0] !== 0 ||
                        filters.rankingRange[1] !== 100) && (
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 text-xs"
                        >
                          Active
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 text-left">
                      {filters.rankingRange[0]} - {filters.rankingRange[1]}
                    </div>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-4 border-b bg-gradient-to-r from-purple-50 to-transparent">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <span className="text-lg">📊</span>
                      Select Ranking Range
                    </h4>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="px-2">
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={filters.rankingRange}
                        onValueChange={handleRankingChange}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center justify-between px-2">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium">
                          Min
                        </span>
                        <span className="text-lg font-bold text-purple-600">
                          {filters.rankingRange[0]}
                        </span>
                      </div>
                      <div className="flex-1 text-center">
                        <span className="text-xs text-gray-400">Range</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500 font-medium">
                          Max
                        </span>
                        <span className="text-lg font-bold text-purple-600">
                          {filters.rankingRange[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
