import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllQuestions } from '../utils/questions';
import { getAllGuides } from '../utils/guides';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Code2, Palette, BookOpen, ArrowRight, BookMarked } from 'lucide-react';

export const ReviewLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const allQuestions = getAllQuestions();
  const allGuides = getAllGuides();

  const filterQuestions = (questions: any[]) => {
    if (!searchQuery.trim()) return questions;
    return questions.filter((q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'javascript':
        return <Code2 className="h-6 w-6" />;
      case 'css':
        return <Palette className="h-6 w-6" />;
      default:
        return <BookOpen className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'javascript':
        return 'from-yellow-400 to-yellow-600';
      case 'css':
        return 'from-blue-400 to-blue-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-blue-100 rounded-full mb-4">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Review & Learning Hub
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse quiz questions and comprehensive guides organized by topic.
            Learn at your own pace with our learning resources.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
            onClick={() => void navigate('#questions')}
          >
            <CardContent className="pt-6 text-center">
              <Code2 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Quiz Questions
              </h3>
              <p className="text-gray-600 mb-4">
                Practice with {Object.values(allQuestions).reduce((sum, q) => sum + q.length, 0)} interview questions
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {Object.keys(allQuestions).length} Categories
              </Badge>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-500"
            onClick={() => void navigate('/review/guides')}
          >
            <CardContent className="pt-6 text-center">
              <BookMarked className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Learning Guides
              </h3>
              <p className="text-gray-600 mb-4">
                Comprehensive guides for {Object.values(allGuides).reduce((sum, g) => sum + g.length, 0)} topics
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {Object.keys(allGuides).length} Categories
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg shadow-lg"
            />
          </div>
        </div>

        {/* Stats */}
        <div id="questions" className="scroll-mt-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Quiz Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">
                {Object.values(allQuestions).reduce(
                  (sum, q) => sum + q.length,
                  0
                )}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Questions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-yellow-600">
                {allQuestions.javascript?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                JavaScript Questions
              </div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">
                {allQuestions.css?.length || 0}
              </div>
              <div className="text-sm text-gray-600 mt-1">CSS Questions</div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {Object.entries(allQuestions).map(([category, questions]) => {
            const filteredQuestions = filterQuestions(questions);

            if (filteredQuestions.length === 0 && searchQuery) return null;

            return (
              <Card key={category} className="overflow-hidden">
                <CardHeader
                  className={`bg-gradient-to-r ${getCategoryColor(category)} text-white`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(category)}
                      <div>
                        <CardTitle className="text-2xl capitalize">
                          {category}
                        </CardTitle>
                        <p className="text-white/80 text-sm mt-1">
                          {filteredQuestions.length} questions available
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Question List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredQuestions.slice(0, 10).map((question, index) => (
                      <Link
                        key={question.slug}
                        to={question.path}
                        className="block group"
                      >
                        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                          <Badge variant="secondary" className="mt-0.5">
                            {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {question.title}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-0.5" />
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* View All Button */}
                  {filteredQuestions.length > 10 && (
                    <Link
                      to={`/review/${category}/${filteredQuestions[0].slug}`}
                    >
                      <Button variant="outline" className="w-full mt-4">
                        View All {filteredQuestions.length} Questions
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}

                  {/* Start Learning Button */}
                  {filteredQuestions.length > 0 && (
                    <Link
                      to={`/review/${category}/${filteredQuestions[0].slug}`}
                    >
                      <Button className="w-full mt-2">
                        Start Learning
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {searchQuery &&
          Object.values(allQuestions).every(
            (q) => filterQuestions(q).length === 0
          ) && (
            <Card className="max-w-2xl mx-auto mt-8">
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No questions found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search query
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
