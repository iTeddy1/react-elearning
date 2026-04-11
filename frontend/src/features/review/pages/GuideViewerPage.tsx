import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GuideSidebar } from '../components/GuideSidebar';
import { MDXRenderer } from '../components/MDXRenderer';
import { HighlightToolbar } from '../components/HighlightToolbar';
import { HighlightableContent } from '../components/HighlightableContent';
import { useHighlights } from '../hooks/useHighlights';
import {
  getAllGuides,
  getGuideContent,
  getAdjacentGuides,
} from '../utils/guides';

export const GuideViewerPage: React.FC = () => {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const contentPath = `guides/${category}/${slug}`;
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

  const guides = getAllGuides();

  const adjacentGuides = useMemo(() => {
    if (!category || !slug) return { previous: null, next: null };
    return getAdjacentGuides(category, slug);
  }, [category, slug]);

  useEffect(() => {
    const loadContent = async () => {
      if (!category || !slug) return;

      setLoading(true);
      const guideContent = await getGuideContent(category, slug);
      if (guideContent) {
        setContent(guideContent);
      }
      setLoading(false);
    };

    void loadContent();
  }, [category, slug]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && adjacentGuides.previous) {
        void navigate(adjacentGuides.previous.path);
      } else if (e.key === 'ArrowRight' && adjacentGuides.next) {
        void navigate(adjacentGuides.next.path);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [adjacentGuides, navigate]);

  const handleNavigate = (navCategory: string, navSlug: string) => {
    void navigate(`/review/guides/${navCategory}/${navSlug}`);
  };

  const currentGuide =
    category && slug ? guides[category]?.find((g) => g.slug === slug) : null;

  return (
    <div className="flex h-screen bg-white">
      <GuideSidebar
        guides={guides}
        currentCategory={category}
        currentSlug={slug}
        onNavigate={handleNavigate}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="border-b bg-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void navigate('/review')}
              className="gap-2"
            >
              <Home className="w-4 h-4" />
              Back to Review
            </Button>
            {category && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void navigate(`/review/guides/${category}`)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                adjacentGuides.previous &&
                void navigate(adjacentGuides.previous.path)
              }
              disabled={!adjacentGuides.previous}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                adjacentGuides.next && void navigate(adjacentGuides.next.path)
              }
              disabled={!adjacentGuides.next}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading guide...</div>
              </div>
            ) : content ? (
              <>
                {currentGuide && (
                  <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {currentGuide.title}
                    </h1>
                    {currentGuide.description && (
                      <p className="text-lg text-gray-600">
                        {currentGuide.description}
                      </p>
                    )}
                  </div>
                )}
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
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Guide not found
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        {(adjacentGuides.previous || adjacentGuides.next) && (
          <div className="border-t bg-gray-50 px-6 py-4">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div className="flex-1">
                {adjacentGuides.previous && (
                  <button
                    onClick={() => void navigate(adjacentGuides.previous!.path)}
                    className="text-left hover:text-blue-600 transition-colors group"
                  >
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <ChevronLeft className="w-3 h-3" />
                      Previous Guide
                    </div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600">
                      {adjacentGuides.previous.title}
                    </div>
                  </button>
                )}
              </div>

              <div className="flex-1 text-right">
                {adjacentGuides.next && (
                  <button
                    onClick={() => void navigate(adjacentGuides.next!.path)}
                    className="text-right hover:text-blue-600 transition-colors group"
                  >
                    <div className="text-xs text-gray-500 mb-1 flex items-center justify-end gap-1">
                      Next Guide
                      <ChevronRight className="w-3 h-3" />
                    </div>
                    <div className="font-medium text-gray-900 group-hover:text-blue-600">
                      {adjacentGuides.next.title}
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Highlight Toolbar */}
      {!loading && content && (
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
                'Are you sure you want to clear all highlights for this guide?'
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
