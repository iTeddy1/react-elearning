import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, Home } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllGuides } from '../utils/guides';

export const GuidesLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const guides = getAllGuides();

  const getCategoryInfo = (
    category: string
  ): { title: string; description: string; color: string } => {
    const info: Record<
      string,
      { title: string; description: string; color: string }
    > = {
      react: {
        title: 'React',
        description:
          'Comprehensive guides for React concepts, patterns, and best practices',
        color: 'bg-blue-500',
      },
      behavioral: {
        title: 'Behavioral',
        description:
          'Interview preparation and behavioral question strategies',
        color: 'bg-green-500',
      },
      'system-design': {
        title: 'System Design',
        description: 'System design principles and architectural patterns',
        color: 'bg-purple-500',
      },
    };
    return (
      info[category] || {
        title: category,
        description: '',
        color: 'bg-gray-500',
      }
    );
  };

  const filteredGuides = Object.entries(guides).reduce(
    (acc, [category, guideList]) => {
      const filtered = guideList.filter(
        (guide) =>
          guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          guide.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {} as typeof guides
  );

  const totalGuides = Object.values(guides).reduce(
    (sum, list) => sum + list.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void navigate('/review')}
            className="mb-6 gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Review Home
          </Button>

          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900">
              Learning Guides
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive guides to help you master concepts and prepare for
            technical interviews
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search guides by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm font-medium">
                Total Guides
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{totalGuides}</div>
            </CardContent>
          </Card>

          {Object.keys(guides).map((category) => {
            const info = getCategoryInfo(category);
            return (
              <Card
                key={category}
                className={`bg-gradient-to-br ${info.color} to-opacity-80 text-white`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-sm font-medium">
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {guides[category].length}
                  </div>
                  <div className="text-xs mt-1 text-white/80">guides</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {Object.entries(filteredGuides).map(([category, guideList]) => {
            const info = getCategoryInfo(category);

            return (
              <Card key={category} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-12 rounded-full ${info.color}`}
                      ></div>
                      <div>
                        <CardTitle className="text-2xl font-bold">
                          {info.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {info.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {guideList.length} guides
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {guideList.map((guide) => (
                      <button
                        key={guide.slug}
                        onClick={() => void navigate(guide.path)}
                        className="text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 mb-1 leading-snug">
                              {guide.title}
                            </h3>
                            {guide.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {guide.description}
                              </p>
                            )}
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {Object.keys(filteredGuides).length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No guides found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
