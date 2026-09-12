// libs/vortex-react/src/editor/ColorPicker.tsx
// React parity of ColorPicker.svelte: a swatch grid for the text-color and highlight marks.
// Text colour uses @tiptap/extension-color (setColor/unsetColor); highlight uses the
// multicolor Highlight extension.
import { useState } from 'react';
import type { Editor } from '@tiptap/react';
import { Palette, Highlighter } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '..';
import { cn } from '@cloudvoyant/vortex-ui';

const COLORS = ['yellow', 'orange', 'red', 'fuchsia', 'violet', 'blue', 'cyan', 'green', 'slate'] as const;

const TEXT_PREVIEW: Record<string, string> = {
  yellow: '#f59e0b',
  orange: '#f97316',
  red: '#ef4444',
  fuchsia: '#d946ef',
  violet: '#8b5cf6',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  green: '#10b981',
  slate: '#64748b',
};

const HIGHLIGHT_PREVIEW: Record<string, string> = {
  yellow: '#fef9c3',
  orange: '#ffedd5',
  red: '#fee2e2',
  fuchsia: '#fae8ff',
  violet: '#ede9fe',
  blue: '#dbeafe',
  cyan: '#cffafe',
  green: '#d1fae5',
  slate: '#e2e8f0',
};

export interface ColorPickerProps {
  editor: Editor;
  mode: 'text' | 'highlight';
}

export function ColorPicker({ editor, mode }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const preview = mode === 'highlight' ? HIGHLIGHT_PREVIEW : TEXT_PREVIEW;

  function selectColor(colorId: string) {
    if (mode === 'highlight') {
      // Highlight stores the palette id in `data-color`; theme CSS maps it.
      editor.chain().focus().toggleHighlight({ color: colorId }).run();
    } else {
      // @tiptap/extension-color writes an inline `style`, so it needs a real CSS colour —
      // a bare palette id like 'slate' is invalid CSS and silently does nothing.
      editor
        .chain()
        .focus()
        .setColor(preview[colorId] ?? colorId)
        .run();
    }
    setOpen(false);
  }

  function clearColor() {
    if (mode === 'highlight') {
      editor.chain().focus().unsetHighlight().run();
    } else {
      editor.chain().focus().unsetColor().run();
    }
    setOpen(false);
  }

  const label = mode === 'highlight' ? 'Highlight color' : 'Text color';

  return (
    <Popover open={open} onOpenChange={(details) => setOpen(details.open)}>
      <PopoverTrigger
        aria-label={label}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
      >
        {mode === 'highlight' ? <Highlighter className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        <div className="grid grid-cols-5 gap-1">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => selectColor(color)}
              className={cn('h-6 w-6 rounded border border-border transition-transform hover:scale-110')}
              style={{ backgroundColor: preview[color] }}
            />
          ))}
        </div>
        <button type="button" onClick={clearColor} className="mt-2 w-full rounded px-2 py-1 text-xs hover:bg-muted">
          Clear
        </button>
      </PopoverContent>
    </Popover>
  );
}
