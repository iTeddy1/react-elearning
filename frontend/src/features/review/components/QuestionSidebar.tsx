import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionMetadata, QuestionsByCategory, FilterOptions } from '../types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FilterPanel } from './FilterPanel';
import { QuestionCard } from './QuestionCard';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Code2,
  Palette,
  BookOpen,
} from 'lucide-react';

interface QuestionSidebarProps {
  questions: QuestionsByCategory;
  currentCategory?: string;
  currentSlug?: string;
}

export const QuestionSidebar: React.FC<QuestionSidebarProps> = ({
  questions,
  currentCategory,
  currentSlug,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['javascript', 'css', 'react'])
  );
  const [filters, setFilters] = useState<FilterOptions>({
    topics: [],
    importance: [],
    difficulty: [],
    rankingRange: [0, 100],
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Get all available topics from metadata
  const availableTopics = useMemo(() => {
    const topics = new Set<string>();
    Object.values(questions).forEach((categoryQuestions) => {
      categoryQuestions.forEach((q) => {
        q.metadata?.topics?.forEach((topic) => topics.add(topic));
      });
    });
    return Array.from(topics).sort();
  }, [questions]);

  // Apply filters and search
  const filterQuestions = (
    categoryQuestions: QuestionMetadata[]
  ): QuestionMetadata[] => {
    let filtered = categoryQuestions;

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((q) =>
        q.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Topics filter
    if (filters.topics.length > 0) {
      filtered = filtered.filter((q) =>
        q.metadata?.topics?.some((topic) => filters.topics.includes(topic))
      );
    }

    // Importance filter
    if (filters.importance.length > 0) {
      filtered = filtered.filter((q) =>
        q.metadata?.importance
          ? filters.importance.includes(q.metadata.importance)
          : false
      );
    }

    // Difficulty filter
    if (filters.difficulty.length > 0) {
      filtered = filtered.filter((q) =>
        q.metadata?.difficulty
          ? filters.difficulty.includes(q.metadata.difficulty)
          : false
      );
    }

    // Ranking filter
    if (filters.rankingRange[0] !== 0 || filters.rankingRange[1] !== 100) {
      filtered = filtered.filter((q) => {
        const ranking = q.metadata?.ranking ?? 50;
        return (
          ranking >= filters.rankingRange[0] &&
          ranking <= filters.rankingRange[1]
        );
      });
    }

    return filtered;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'javascript':
        return <Code2 className="h-4 w-4" />;
      case 'css':
        return <Palette className="h-4 w-4" />;
      case 'react':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Code2 className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r w-96">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Quiz Questions
        </h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        availableTopics={availableTopics}
      />

      {/* Question List */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {Object.entries(questions).map(([category, categoryQuestions]) => {
            const filteredQuestions = filterQuestions(categoryQuestions);
            const isExpanded = expandedCategories.has(category);

            if (filteredQuestions.length === 0 && searchQuery) return null;

            return (
              <div key={category} className="space-y-2">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    <span className="font-semibold capitalize text-sm">
                      {category}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {filteredQuestions.length}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                {/* Questions List */}
                {isExpanded && (
                  <div className="space-y-1 pl-2">
                    {filteredQuestions.map((question) => {
                      const isActive =
                        currentCategory === category &&
                        currentSlug === question.slug;

                      return (
                        <QuestionCard
                          key={question.slug}
                          question={question}
                          isActive={isActive}
                          onClick={() => void navigate(question.path)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer Stats */}
      <div className="p-4 border-t bg-white text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Total Questions:</span>
          <span className="font-semibold">
            {Object.values(questions).reduce((sum, q) => sum + q.length, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
