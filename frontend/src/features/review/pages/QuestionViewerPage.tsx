import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QuestionSidebar } from '../components/QuestionSidebar';
import { MDXRenderer } from '../components/MDXRenderer';
import { HighlightToolbar } from '../components/HighlightToolbar';
import { HighlightableContent } from '../components/HighlightableContent';
import { useHighlights } from '../hooks/useHighlights';
import {
  getAllQuestions,
  getQuestionContent,
  getAdjacentQuestions,
} from '../utils/questions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const QuestionViewerPage: React.FC = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const navigate = useNavigate();

  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const contentPath = `questions/${category}/${slug}`;
  const {
    highlights,
    selectedColor,
    setSelectedColor,
    addHighlight,
    removeHighlight,
    clearAllHighlights,
    exportHighlights,
    importHighlights,
  } = useHighlights(contentPath);

  const allQuestions = getAllQuestions();
  const adjacentQuestions = useMemo(
    () =>
      category && slug
        ? getAdjacentQuestions(category, slug)
        : { previous: null, next: null },
    [category, slug]
  );

  useEffect(() => {
    const loadContent = async () => {
      if (!category || !slug) {
        setError('Invalid question URL');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const questionContent = await getQuestionContent(category, slug);
        if (questionContent) {
          setContent(questionContent);
        } else {
          setError('Question not found');
        }
      } catch (err) {
        console.error('Failed to load question:', err);
        setError('Failed to load question content');
      } finally {
        setLoading(false);
      }
    };

    void loadContent();
  }, [category, slug]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && adjacentQuestions.previous) {
        void navigate(adjacentQuestions.previous.path);
      } else if (e.key === 'ArrowRight' && adjacentQuestions.next) {
        void navigate(adjacentQuestions.next.path);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [adjacentQuestions, navigate]);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0">
        <QuestionSidebar
          questions={allQuestions}
          currentCategory={category}
          currentSlug={slug}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            {category && (
              <Badge variant="secondary" className="capitalize">
                {category}
              </Badge>
            )}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!adjacentQuestions.previous}
              onClick={() => {
                if (adjacentQuestions.previous) {
                  void navigate(adjacentQuestions.previous.path);
                }
              }}
              title="Previous question (← key)"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!adjacentQuestions.next}
              onClick={() => {
                if (adjacentQuestions.next) {
                  void navigate(adjacentQuestions.next.path);
                }
              }}
              title="Next question (→ key)"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800">Error</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-red-700">{error}</p>
                  <Link to="/review">
                    <Button variant="outline" className="mt-4">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Questions
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {!loading && !error && content && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <HighlightableContent
                  highlights={highlights}
                  onTextSelect={() => {
                    const selection = window.getSelection();
                    if (selection && !selection.isCollapsed) {
                      // Selection made, toolbar will handle it
                    }
                  }}
                >
                  <MDXRenderer content={content} />
                </HighlightableContent>

                {/* Bottom Navigation */}
                <div className="mt-12 pt-8 border-t flex items-center justify-between">
                  {adjacentQuestions.previous ? (
                    <Link to={adjacentQuestions.previous.path}>
                      <Button variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        <div className="text-left">
                          <div className="text-xs text-gray-500">Previous</div>
                          <div className="text-sm line-clamp-1">
                            {adjacentQuestions.previous.title}
                          </div>
                        </div>
                      </Button>
                    </Link>
                  ) : (
                    <div />
                  )}

                  {adjacentQuestions.next ? (
                    <Link to={adjacentQuestions.next.path}>
                      <Button variant="outline">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Next</div>
                          <div className="text-sm line-clamp-1">
                            {adjacentQuestions.next.title}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Highlight Toolbar */}
      {!loading && !error && content && (
        <HighlightToolbar
          highlightCount={highlights.length}
          selectedColor={selectedColor}
          onColorChange={setSelectedColor}
          onHighlight={() => {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
              const text = selection.toString().trim();
              if (text) {
                addHighlight(text, selectedColor);
              }
            }
          }}
          onClearAll={() => {
            if (
              window.confirm(
                'Are you sure you want to clear all highlights for this question?'
              )
            ) {
              clearAllHighlights();
            }
          }}
          onExport={exportHighlights}
          onImport={importHighlights}
          highlights={highlights}
          onRemoveHighlight={removeHighlight}
        />
      )}
    </div>
  );
};
