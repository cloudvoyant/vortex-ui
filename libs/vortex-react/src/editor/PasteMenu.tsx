// libs/vortex-react/src/editor/PasteMenu.tsx
// React parity of PasteMenu.svelte: after a pasted URL, offer link / pill / bookmark.
import { useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import type { Content } from '@tiptap/core';
import { Link2, Bookmark, AtSign } from 'lucide-react';

export interface PasteMenuProps {
  editor: Editor;
  url: string;
  /** Where the pasted URL text landed, so the chosen form can replace it. */
  position: number;
  onClose: () => void;
}

export function PasteMenu({ editor, url, position, onClose }: PasteMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [onClose]);

  /** Replace the pasted text with the chosen representation. */
  function replaceWith(node: Content) {
    const { doc } = editor.state;
    // The pasted URL is plain text at `position`; select the whole doc range it occupies by
    // matching the url text at that position.
    const text = doc.textBetween(position, doc.content.size, '\n', '\n');
    const end = position + Math.min(text.indexOf(url) === 0 ? url.length : text.length, text.length);
    editor.chain().focus().deleteRange({ from: position, to: end }).insertContent(node).run();
    onClose();
  }

  return (
    <div
      ref={ref}
      role="menu"
      className="w-56 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg"
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
        onClick={() =>
          replaceWith({
            type: 'text',
            marks: [{ type: 'link', attrs: { href: url } }],
            text: url,
          })
        }
      >
        <Link2 className="h-4 w-4 opacity-70" />
        Plain link
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
        onClick={() =>
          replaceWith({
            type: 'urlMention',
            attrs: { url, title: url, favicon: null },
          })
        }
      >
        <AtSign className="h-4 w-4 opacity-70" />
        Link pill
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-accent"
        onClick={() => {
          const pos = position;
          editor
            .chain()
            .focus()
            .deleteRange({ from: pos, to: pos + url.length })
            .run();
          // SAFETY: Tiptap storage is an open, untyped per-extension bag; the editor component
          // reads this same key back and its guard validates the shape before use.
          (editor.storage as unknown as Record<string, unknown>)['bookmarkInput'] = {
            active: true,
            position: pos,
          };
          onClose();
        }}
      >
        <Bookmark className="h-4 w-4 opacity-70" />
        Bookmark card
      </button>
    </div>
  );
}
