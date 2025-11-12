import React, { useState } from 'react';
import {
  Highlighter,
  Trash2,
  Download,
  Upload,
  Palette,
  X,
  Check,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface HighlightToolbarProps {
  highlightCount: number;
  selectedColor: string;
  onColorChange: (color: string) => void;
  onHighlight: () => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
  highlights: Array<{
    id: string;
    text: string;
    color: string;
    createdAt: number;
  }>;
  onRemoveHighlight: (id: string) => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FEF08A', class: 'bg-yellow-200' },
  { name: 'Green', value: '#BBF7D0', class: 'bg-green-200' },
  { name: 'Blue', value: '#BFDBFE', class: 'bg-blue-200' },
  { name: 'Pink', value: '#FBCFE8', class: 'bg-pink-200' },
  { name: 'Purple', value: '#E9D5FF', class: 'bg-purple-200' },
  { name: 'Orange', value: '#FED7AA', class: 'bg-orange-200' },
];

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  highlightCount,
  selectedColor,
  onColorChange,
  onHighlight,
  onClearAll,
  onExport,
  onImport,
  highlights,
  onRemoveHighlight,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightsList, setShowHighlightsList] = useState(false);

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImport(file);
    };
    input.click();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Highlights List */}
      {showHighlightsList && highlights.length > 0 && (
        <Card className="absolute bottom-20 right-0 w-[480px] shadow-xl mb-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Highlighter className="w-5 h-5" />
                My Highlights ({highlights.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHighlightsList(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              <div className="space-y-2 p-4">
                {highlights
                  .sort((a, b) => b.createdAt - a.createdAt)
                  .map((highlight) => (
                    <div
                      key={highlight.id}
                      className="p-3 rounded-lg border hover:border-gray-400 transition-colors group"
                      style={{ backgroundColor: `${highlight.color}30` }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Color indicator */}
                          <div
                            className="w-3 h-3 rounded-full mb-2 border border-gray-300"
                            style={{ backgroundColor: highlight.color }}
                          />
                          
                          {/* Full text display */}
                          <div className="mb-2">
                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap break-words">
                              &ldquo;{highlight.text}&rdquo;
                            </p>
                          </div>

                          {/* Metadata */}
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-gray-500">
                              {formatDate(highlight.createdAt)}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {highlight.text.length} chars
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                              >
                                <Maximize2 className="w-3 h-3 text-gray-500" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96 p-4" side="left">
                              <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-4 h-4 rounded-full border"
                                    style={{ backgroundColor: highlight.color }}
                                  />
                                  <span className="text-sm font-semibold">
                                    Full Highlight
                                  </span>
                                </div>
                                <ScrollArea className="h-64">
                                  <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                                    {highlight.text}
                                  </p>
                                </ScrollArea>
                                <div className="text-xs text-gray-500 pt-2 border-t">
                                  <div>Created: {formatDate(highlight.createdAt)}</div>
                                  <div>Length: {highlight.text.length} characters</div>
                                  <div>Words: {highlight.text.split(/\s+/).length}</div>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveHighlight(highlight.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                          >
                            <Trash2 className="w-3 h-3 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Color Picker */}
      {showColorPicker && (
        <div className="absolute bottom-20 right-0 bg-white rounded-lg shadow-xl border p-4 mb-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Highlight Color
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColorPicker(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => {
                  onColorChange(color.value);
                  setShowColorPicker(false);
                }}
                className={`${color.class} h-10 rounded-md border-2 transition-all hover:scale-105 relative ${
                  selectedColor === color.value
                    ? 'border-gray-900'
                    : 'border-gray-300'
                }`}
                title={color.name}
              >
                {selectedColor === color.value && (
                  <Check className="w-4 h-4 text-gray-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <Card className="shadow-xl">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {/* Highlight Count Badge */}
            <Badge variant="secondary" className="px-3 py-1">
              <Highlighter className="w-3 h-3 mr-1" />
              {highlightCount}
            </Badge>

            {/* Color Picker Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="gap-2"
              title="Choose highlight color"
            >
              <div
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: selectedColor }}
              />
              <Palette className="w-4 h-4" />
            </Button>

            {/* Highlight Button */}
            <Button
              variant="default"
              size="sm"
              onClick={onHighlight}
              className="gap-2"
              title="Highlight selected text (or select text first)"
            >
              <Highlighter className="w-4 h-4" />
              Highlight
            </Button>

            {/* View Highlights */}
            {highlights.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHighlightsList(!showHighlightsList)}
                title="View all highlights"
              >
                <Highlighter className="w-4 h-4" />
              </Button>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-gray-300" />

            {/* Export Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onExport}
              title="Export highlights"
            >
              <Download className="w-4 h-4" />
            </Button>

            {/* Import Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleImport}
              title="Import highlights"
            >
              <Upload className="w-4 h-4" />
            </Button>

            {/* Clear All Button */}
            {highlightCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="text-red-500 hover:text-red-700"
                title="Clear all highlights"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
