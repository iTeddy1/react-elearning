import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GuidesByCategory } from '../types';

interface GuideSidebarProps {
  guides: GuidesByCategory;
  currentCategory?: string;
  currentSlug?: string;
  onNavigate: (category: string, slug: string) => void;
}

export const GuideSidebar: React.FC<GuideSidebarProps> = ({
  guides,
  currentCategory,
  currentSlug,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(currentCategory ? [currentCategory] : Object.keys(guides))
  );

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const getCategoryIcon = () => {
    return <BookOpen className="w-4 h-4" />;
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      react: 'React',
      behavioral: 'Behavioral',
      'system-design': 'System Design',
    };
    return labels[category] || category;
  };

  const filteredGuides = Object.entries(guides).reduce(
    (acc, [category, guideList]) => {
      const filtered = guideList.filter((guide) =>
        guide.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as GuidesByCategory
  );

  const totalGuides = Object.values(guides).reduce(
    (sum, list) => sum + list.length,
    0
  );

  return (
    <div className="w-80 border-r bg-gray-50 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Guides
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Guide List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {Object.entries(filteredGuides).map(([category, guideList]) => (
            <div key={category} className="mb-2">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-3 hover:bg-white rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2">
                  {expandedCategories.has(category) ? (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  )}
                  {getCategoryIcon()}
                  <span className="font-semibold text-gray-900">
                    {getCategoryLabel(category)}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {guideList.length}
                </Badge>
              </button>

              {expandedCategories.has(category) && (
                <div className="ml-4 mt-1 space-y-1">
                  {guideList.map((guide) => {
                    const isActive =
                      currentCategory === category &&
                      currentSlug === guide.slug;

                    return (
                      <button
                        key={guide.slug}
                        onClick={() => onNavigate(category, guide.slug)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-900'
                            : 'hover:bg-white text-gray-700 hover:text-gray-900 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="font-medium text-sm leading-snug">
                          {guide.title}
                        </div>
                        {guide.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {guide.description}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t bg-white text-center">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">{totalGuides}</span> guides total
        </p>
      </div>
    </div>
  );
};
