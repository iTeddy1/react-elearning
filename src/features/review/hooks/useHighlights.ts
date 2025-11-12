import { useState, useEffect, useCallback } from 'react';

export interface Highlight {
  id: string;
  text: string;
  color: string;
  range: {
    startOffset: number;
    endOffset: number;
    startContainer: string;
    endContainer: string;
  };
  createdAt: number;
}

export interface HighlightData {
  [path: string]: Highlight[];
}

const STORAGE_KEY = 'review-highlights';

export const useHighlights = (contentPath: string) => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#FEF08A'); // yellow-200

  // Load highlights from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: HighlightData = JSON.parse(stored);
        setHighlights(data[contentPath] || []);
      } catch (error) {
        console.error('Failed to load highlights:', error);
      }
    }
  }, [contentPath]);

  // Save highlights to localStorage
  const saveHighlights = useCallback(
    (newHighlights: Highlight[]) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data: HighlightData = stored ? JSON.parse(stored) : {};
        data[contentPath] = newHighlights;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setHighlights(newHighlights);
      } catch (error) {
        console.error('Failed to save highlights:', error);
      }
    },
    [contentPath]
  );

  // Add a new highlight
  const addHighlight = useCallback(
    (text: string, color: string = selectedColor) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const id = `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const newHighlight: Highlight = {
        id,
        text,
        color,
        range: {
          startOffset: range.startOffset,
          endOffset: range.endOffset,
          startContainer: range.startContainer.textContent || '',
          endContainer: range.endContainer.textContent || '',
        },
        createdAt: Date.now(),
      };

      const updated = [...highlights, newHighlight];
      saveHighlights(updated);

      // Clear selection after highlighting
      selection.removeAllRanges();

      return id;
    },
    [highlights, saveHighlights, selectedColor]
  );

  // Remove a highlight
  const removeHighlight = useCallback(
    (id: string) => {
      const updated = highlights.filter((h) => h.id !== id);
      saveHighlights(updated);
    },
    [highlights, saveHighlights]
  );

  // Clear all highlights for current content
  const clearAllHighlights = useCallback(() => {
    saveHighlights([]);
  }, [saveHighlights]);

  // Get all highlights across all content
  const getAllHighlights = useCallback((): HighlightData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }, []);

  // Export highlights
  const exportHighlights = useCallback(() => {
    const data = getAllHighlights();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `highlights-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getAllHighlights]);

  // Import highlights
  const importHighlights = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: HighlightData = JSON.parse(e.target?.result as string);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setHighlights(data[contentPath] || []);
      } catch (error) {
        console.error('Failed to import highlights:', error);
      }
    };
    reader.readAsText(file);
  }, [contentPath]);

  return {
    highlights,
    selectedColor,
    setSelectedColor,
    addHighlight,
    removeHighlight,
    clearAllHighlights,
    exportHighlights,
    importHighlights,
  };
};
