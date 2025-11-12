import React, { useEffect, useRef, useCallback } from 'react';

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

  const applyHighlights = useCallback(() => {
    if (!contentRef.current) return;

    // Remove all existing highlights
    const existingMarks = contentRef.current.querySelectorAll('mark[data-highlight-id]');
    existingMarks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        // Replace mark with its text content
        const textNode = document.createTextNode(mark.textContent || '');
        parent.replaceChild(textNode, mark);
        parent.normalize(); // Merge adjacent text nodes
      }
    });

    // Apply new highlights
    highlights.forEach((highlight) => {
      const walker = document.createTreeWalker(
        contentRef.current!,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip if parent is already a highlight
            if (node.parentElement?.hasAttribute('data-highlight-id')) {
              return NodeFilter.FILTER_REJECT;
            }
            // Skip if parent is a script or style tag
            if (
              node.parentElement?.tagName === 'SCRIPT' ||
              node.parentElement?.tagName === 'STYLE'
            ) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || '';
        const index = text.indexOf(highlight.text);

        if (index !== -1 && textNode.parentElement) {
          const parent = textNode.parentElement;
          
          // Split the text node into three parts
          const before = text.substring(0, index);
          const match = highlight.text;
          const after = text.substring(index + match.length);

          // Create the highlight mark element
          const mark = document.createElement('mark');
          mark.setAttribute('data-highlight-id', highlight.id);
          mark.style.backgroundColor = highlight.color;
          mark.style.padding = '2px 4px';
          mark.style.borderRadius = '3px';
          mark.style.transition = 'all 0.2s';
          mark.className = 'highlight-mark cursor-pointer hover:shadow-sm';
          mark.textContent = match;

          // Create document fragment for efficient DOM manipulation
          const fragment = document.createDocumentFragment();
          
          if (before) {
            fragment.appendChild(document.createTextNode(before));
          }
          
          fragment.appendChild(mark);
          
          if (after) {
            fragment.appendChild(document.createTextNode(after));
          }

          // Replace the original text node
          parent.replaceChild(fragment, textNode);
        }
      });
    });
  }, [highlights]);

  useEffect(() => {
    // Apply highlights after content is rendered
    const timer = setTimeout(applyHighlights, 100);
    return () => clearTimeout(timer);
  }, [applyHighlights, children]);

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
