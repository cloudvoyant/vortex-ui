// libs/vortex-react/src/editor/BubbleMenu.tsx
// React parity of BubbleMenu.svelte: the selection toolbar. Renders through Tiptap's React
// BubbleMenu and composes vortex ToggleGroup + ColorPicker with matching mark and alignment
// actions in each framework.
import { BubbleMenu as TiptapBubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '..';
import { ColorPicker } from './ColorPicker';

export interface BubbleMenuProps {
  editor: Editor;
  onUpload?: (file: File) => Promise<{ src: string; srcset?: string }>;
}

export function BubbleMenu({ editor }: BubbleMenuProps) {
  const currentAlign = ['left', 'center', 'right', 'justify'].find((a) => editor.isActive({ textAlign: a }));

  return (
    <TiptapBubbleMenu
      editor={editor}
      options={{ placement: 'top' }}
      className="flex items-center gap-1 rounded-md border border-border bg-popover p-1 shadow-md"
    >
      <ToggleGroup multiple defaultValue={[]}>
        <ToggleGroupItem
          value="bold"
          size="sm"
          aria-label="Bold"
          data-state={editor.isActive('bold') ? 'on' : 'off'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          size="sm"
          aria-label="Italic"
          data-state={editor.isActive('italic') ? 'on' : 'off'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="underline"
          size="sm"
          aria-label="Underline"
          data-state={editor.isActive('underline') ? 'on' : 'off'}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="strike"
          size="sm"
          aria-label="Strikethrough"
          data-state={editor.isActive('strike') ? 'on' : 'off'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </ToggleGroupItem>
      </ToggleGroup>

      <ColorPicker editor={editor} mode="text" />
      <ColorPicker editor={editor} mode="highlight" />

      <ToggleGroup defaultValue={currentAlign ? [currentAlign] : []}>
        {(
          [
            ['left', AlignLeft],
            ['center', AlignCenter],
            ['right', AlignRight],
            ['justify', AlignJustify],
          ] as const
        ).map(([align, Icon]) => (
          <ToggleGroupItem
            key={align}
            value={align}
            size="sm"
            aria-label={`Align ${align}`}
            onClick={() => editor.chain().focus().setTextAlign(align).run()}
          >
            <Icon />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <ToggleGroup defaultValue={[]}>
        <ToggleGroupItem
          value="link"
          size="sm"
          aria-label="Link"
          onClick={() => {
            const previous = editor.getAttributes('link').href as string | undefined;
            const url = window.prompt('Link URL', previous ?? '');
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().unsetLink().run();
              return;
            }
            editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          <Link2 />
        </ToggleGroupItem>
      </ToggleGroup>
    </TiptapBubbleMenu>
  );
}
