import React, { useEffect, useRef } from 'react';

interface HighlightableContentProps {
  children: React.ReactNode;
  highlights: Array<{
    id: string;
    text: string;
    color: string;
  }>;
  onTextSelect?: () => void;
}

export const HighlightableContent: React.FC<HighlightableContentProps> = ({
  children,
  highlights,
  onTextSelect,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Apply highlights to the content
    const applyHighlights = () => {
      if (!contentRef.current) return;

      // Get all text nodes
      const walker = document.createTreeWalker(
        contentRef.current,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      // Apply each highlight
      highlights.forEach((highlight) => {
        textNodes.forEach((textNode) => {
          const text = textNode.textContent || '';
          const index = text.indexOf(highlight.text);

          if (index !== -1 && textNode.parentElement) {
            const before = text.substring(0, index);
            const highlighted = highlight.text;
            const after = text.substring(index + highlighted.length);

            const span = document.createElement('mark');
            span.style.backgroundColor = highlight.color;
            span.style.padding = '2px 0';
            span.style.borderRadius = '2px';
            span.className = 'highlight-mark';
            span.setAttribute('data-highlight-id', highlight.id);
            span.textContent = highlighted;

            const parent = textNode.parentElement;
            const beforeNode = document.createTextNode(before);
            const afterNode = document.createTextNode(after);

            parent.insertBefore(beforeNode, textNode);
            parent.insertBefore(span, textNode);
            parent.insertBefore(afterNode, textNode);
            parent.removeChild(textNode);
          }
        });
      });
    };

    // Small delay to ensure content is rendered
    const timer = setTimeout(applyHighlights, 100);

    return () => clearTimeout(timer);
  }, [highlights]);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed && onTextSelect) {
        onTextSelect();
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [onTextSelect]);

  return (
    <div ref={contentRef} className="highlightable-content">
      {children}
    </div>
  );
};
