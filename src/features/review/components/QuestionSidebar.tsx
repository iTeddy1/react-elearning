import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { QuestionMetadata, QuestionsByCategory } from '../types';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Code2,
  Palette,
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
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['javascript', 'css', 'contents', 'behavior', 'system-design'])
  );

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

  const filterQuestions = (
    categoryQuestions: QuestionMetadata[]
  ): QuestionMetadata[] => {
    if (!searchQuery.trim()) return categoryQuestions;

    return categoryQuestions.filter((q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'javascript':
        return <Code2 className="h-4 w-4" />;
      case 'css':
        return <Palette className="h-4 w-4" />;
      case 'contents':
        return <Code2 className="h-4 w-4" />;
      case 'behavior':
        return <Code2 className="h-4 w-4" />;
      case 'system-design':
        return <Code2 className="h-4 w-4" />;
      default:
        return <Code2 className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'javascript':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'css':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-r">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold mb-3">Quiz Questions</h2>

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
                        <Link
                          key={question.slug}
                          to={question.path}
                          className={`
                            block p-3 rounded-lg text-sm transition-all
                            ${
                              isActive
                                ? `${getCategoryColor(category)} font-medium shadow-sm`
                                : 'hover:bg-white hover:shadow-sm text-gray-700'
                            }
                          `}
                        >
                          <div className="line-clamp-2">{question.title}</div>
                        </Link>
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
