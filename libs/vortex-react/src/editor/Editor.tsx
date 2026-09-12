// libs/vortex-react/src/editor/Editor.tsx
// React parity of the Svelte Editor: same props, same seams, same Tiptap JSON contract.
// Consumes the framework-agnostic buildExtensions from vortex-ui and injects the React node
// views.
//
// Menu rendering mirrors the Svelte editor: the suggestion renders only track state here, and
// the menus are rendered from this component's JSX. That keeps them inside the framework tree
// (no duplicate mounts) and lets us position them from the suggestion's clientRect.
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, type Editor as TiptapEditor } from '@tiptap/react';
import type { JSONContent } from '@tiptap/core';
import type { SuggestionKeyDownProps, SuggestionProps } from '@tiptap/suggestion';
import {
  buildExtensions,
  registerImageInsertCallback,
  unregisterImageInsertCallback,
  type EditorCounts,
  type MentionItem,
  type ImageUploadResult,
  type SlashCommandItem,
  type EmojiItem,
} from '@cloudvoyant/vortex-ui';
import { ImageNodeView } from './ImageNodeView';
import { UrlMentionPill } from './UrlMentionPill';
import { LinkPreviewCard } from './LinkPreviewCard';
import { CodeBlockComponent } from './CodeBlockComponent';
import { BubbleMenu } from './BubbleMenu';
import { SlashMenu, type SlashMenuHandle } from './SlashMenu';
import { MentionList, type MentionListHandle } from './MentionList';
import { EmojiList, type EmojiListHandle } from './EmojiList';
import { ImageInput } from './ImageInput';
import { BookmarkInput } from './BookmarkInput';
import { PasteMenu } from './PasteMenu';

export interface EditorHandle {
  focus: () => void;
  updateContent: (json: string) => void;
  getCounts: () => EditorCounts;
}

export interface EditorProps {
  content?: string;
  editable?: boolean;
  onChange?: (data: { content: string; title: string }) => void;
  /** Seam: replaces the source editor's hardcoded internal-search endpoint. */
  mentionSource?: (query: string) => Promise<MentionItem[]>;
  /** Seam: replaces the source editor's hardcoded /read/... hrefs. */
  hrefBuilder?: (item: MentionItem) => string;
  /** Seam: replaces the source editor's app-specific image upload. */
  onUpload?: (file: File) => Promise<ImageUploadResult>;
}

function extractTitle(json: JSONContent): string {
  if (json?.content?.[0]?.type === 'heading' && json.content[0]?.attrs?.level === 1) {
    return json.content[0]?.content?.[0]?.text || '';
  }
  return '';
}

interface MenuState<T> {
  props: SuggestionProps<T> | null;
  coords: { left: number; top: number };
}

/** Shared counts, matching the Svelte editor (300 words/page, 250 words/minute). */
export function getEditorCounts(editor: TiptapEditor | null): EditorCounts {
  const words = editor?.storage.characterCount?.words() ?? 0;
  const chars = editor?.storage.characterCount?.characters() ?? 0;
  return {
    wordCount: words,
    charCount: chars,
    pageCount: Math.max(1, Math.ceil(words / 300)),
    readDuration: Math.max(1, Math.ceil(words / 250)),
  };
}

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor(
  { content = '', editable = true, onChange, mentionSource, hrefBuilder, onUpload },
  ref,
) {
  const [slash, setSlash] = useState<MenuState<SlashCommandItem>>({ props: null, coords: { left: 0, top: 0 } });
  const [mention, setMention] = useState<MenuState<MentionItem>>({ props: null, coords: { left: 0, top: 0 } });
  const [emoji, setEmoji] = useState<MenuState<EmojiItem>>({ props: null, coords: { left: 0, top: 0 } });

  const [imageInput, setImageInput] = useState<{ position: number; coords: { left: number; top: number } } | null>(
    null,
  );
  const [bookmarkInput, setBookmarkInput] = useState<{
    position: number;
    coords: { left: number; top: number };
  } | null>(null);
  const [pasteMenu, setPasteMenu] = useState<{
    url: string;
    position: number;
    coords: { left: number; top: number };
  } | null>(null);

  const slashRef = useRef<SlashMenuHandle>(null);
  const mentionRef = useRef<MentionListHandle>(null);
  const emojiRef = useRef<EmojiListHandle>(null);
  // The editor instance is created asynchronously by useEditor, so the paste handler (which is
  // bound at creation time) reads the menus' setters through refs.
  const menusRef = useRef({ setPasteMenu });

  const extensions = useMemo(
    () =>
      buildExtensions({
        mentionSource,
        hrefBuilder,
        nodeViews: {
          image: () => ReactNodeViewRenderer(ImageNodeView),
          urlMention: () => ReactNodeViewRenderer(UrlMentionPill),
          linkPreview: () => ReactNodeViewRenderer(LinkPreviewCard),
          codeBlock: () => ReactNodeViewRenderer(CodeBlockComponent),
        },
        // State-only renders; the menus are drawn from JSX below.
        mentionRender: () => ({
          onStart: (props: SuggestionProps<MentionItem>) => setMention(menuFrom(props)),
          onUpdate: (props: SuggestionProps<MentionItem>) => setMention(menuFrom(props)),
          onKeyDown: (props: SuggestionKeyDownProps) => mentionRef.current?.onKeyDown(props) ?? false,
          onExit: () => setMention({ props: null, coords: { left: 0, top: 0 } }),
        }),
        slashRender: () => ({
          onStart: (props: SuggestionProps<SlashCommandItem>) => setSlash(menuFrom(props)),
          onUpdate: (props: SuggestionProps<SlashCommandItem>) => setSlash(menuFrom(props)),
          onKeyDown: (props: SuggestionKeyDownProps) => slashRef.current?.onKeyDown(props) ?? false,
          onExit: () => setSlash({ props: null, coords: { left: 0, top: 0 } }),
        }),
        // Without an emoji render, typing ':' silently does nothing in either framework.
        emojiRender: () => ({
          onStart: (props: SuggestionProps<EmojiItem>) => setEmoji(menuFrom(props)),
          onUpdate: (props: SuggestionProps<EmojiItem>) => setEmoji(menuFrom(props)),
          onKeyDown: (props: SuggestionKeyDownProps) => emojiRef.current?.onKeyDown(props) ?? false,
          onExit: () => setEmoji({ props: null, coords: { left: 0, top: 0 } }),
        }),
      }),
    [mentionSource, hrefBuilder],
  );

  // Suggestion renders supply viewport coordinates. Recalculate them while the page or a nested
  // scroll container moves so the fixed menu stays attached to the slash cursor.
  useEffect(() => {
    if (!slash.props) return;
    const updatePosition = () =>
      setSlash((current) => (current.props ? menuFrom(current.props as SuggestionProps<SlashCommandItem>) : current));
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [slash.props]);

  const editor = useEditor({
    extensions,
    editable,
    content: content
      ? JSON.parse(content)
      : {
          type: 'doc',
          content: [
            { type: 'heading', attrs: { level: 1 }, content: [] },
            { type: 'paragraph', content: [] },
          ],
        },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange?.({ content: JSON.stringify(json), title: extractTitle(json) });
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-lg min-h-[500px] max-w-none focus:outline-none [&_mark]:rounded-sm [&_mark]:bg-yellow-200 [&_mark]:px-0.5 dark:[&_mark]:bg-yellow-900/70 [&_mark[data-color=blue]]:bg-blue-200 dark:[&_mark[data-color=blue]]:bg-blue-900/70 [&_mark[data-color=green]]:bg-green-200 dark:[&_mark[data-color=green]]:bg-green-900/70 [&_mark[data-color=red]]:bg-red-200 dark:[&_mark[data-color=red]]:bg-red-900/70 [&_mark[data-color=fuchsia]]:bg-fuchsia-200 dark:[&_mark[data-color=fuchsia]]:bg-fuchsia-900/70 [&_mark[data-color=orange]]:bg-orange-200 dark:[&_mark[data-color=orange]]:bg-orange-900/70 [&_mark[data-color=violet]]:bg-violet-200 dark:[&_mark[data-color=violet]]:bg-violet-900/70 [&_mark[data-color=cyan]]:bg-cyan-200 dark:[&_mark[data-color=cyan]]:bg-cyan-900/70 [&_mark[data-color=slate]]:bg-slate-200 dark:[&_mark[data-color=slate]]:bg-slate-700',
      },
      // Pasting a bare URL opens the paste menu so it can become a link, pill, or bookmark.
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain') ?? '';
        if (!/^https?:\/\/\S+$/i.test(text.trim())) return false;

        event.preventDefault();
        const { from } = view.state.selection;
        const instance = view.state.schema;
        if (!instance) return false;

        // Insert the URL as plain text, then offer the representations.
        view.dispatch(view.state.tr.insertText(text.trim(), from));
        const coords = view.coordsAtPos(from);
        const menuHeight = 150;
        const spaceBelow = window.innerHeight - coords.bottom;
        const top =
          spaceBelow < menuHeight && coords.top > spaceBelow ? coords.top - menuHeight - 8 : coords.bottom + 8;

        menusRef.current.setPasteMenu({
          url: text.trim(),
          position: from,
          coords: { left: coords.left, top },
        });
        return true;
      },
    },
  });

  // The image slash command signals through this editor's own Tiptap storage (storage mutations
  // are not tracked by React state), so register it while mounted. Keyed per editor, so two
  // editors on one page no longer clobber each other's image command.
  useEffect(() => {
    if (!editor) return;
    const instance = editor;
    registerImageInsertCallback(instance, (position) => {
      const coords = instance.view.coordsAtPos(position);
      const menuHeight = 300;
      const spaceBelow = window.innerHeight - coords.bottom;
      const top = spaceBelow < menuHeight && coords.top > spaceBelow ? coords.top - menuHeight - 8 : coords.bottom + 8;
      setImageInput({ position, coords: { left: coords.left, top } });
    });
    return () => unregisterImageInsertCallback(instance);
  }, [editor]);

  // The bookmark slash command writes a flag into editor.storage; poll it into React state.
  useEffect(() => {
    if (!editor) return;

    const sync = () => {
      // SAFETY: Tiptap storage is an open, untyped per-extension bag. The bookmark slash command
      // (in the framework-agnostic layer) writes this key and this effect is its only reader, so
      // there is no typed contract to rely on — the shape is asserted below by the guard.
      const storage = editor.storage as unknown as Record<string, unknown>;
      const flag = storage['bookmarkInput'] as { active?: boolean; position?: number } | undefined;
      if (flag?.active && typeof flag.position === 'number') {
        const position = flag.position;
        const coords = editor.view.coordsAtPos(position);
        setBookmarkInput({ position, coords: { left: coords.left, top: coords.bottom + 8 } });
        storage['bookmarkInput'] = { active: false };
      }
    };

    sync();
    editor.on('transaction', sync);
    return () => {
      editor.off('transaction', sync);
    };
  }, [editor]);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => editor?.commands.focus('start'),
      updateContent: (json: string) => {
        if (editor && json !== JSON.stringify(editor.getJSON())) {
          try {
            editor.commands.setContent(JSON.parse(json));
          } catch (e) {
            console.error('Failed to parse content:', e);
          }
        }
      },
      getCounts: () => getEditorCounts(editor),
    }),
    [editor],
  );

  const closeMenus = useCallback(() => {
    setImageInput(null);
    setBookmarkInput(null);
    setPasteMenu(null);
  }, []);

  return (
    <div className="relative">
      <EditorContent editor={editor} />

      {editor ? <BubbleMenu editor={editor} /> : null}

      {editor && slash.props ? (
        <div className="fixed z-50" style={{ left: slash.coords.left, top: slash.coords.top }}>
          {/* slash.props is already SuggestionProps<SlashCommandItem> — spread it whole. */}
          <SlashMenu ref={slashRef} {...slash.props} />
        </div>
      ) : null}

      {editor && mention.props ? (
        <div className="fixed z-50" style={{ left: mention.coords.left, top: mention.coords.top }}>
          <MentionList ref={mentionRef} {...mention.props} />
        </div>
      ) : null}

      {editor && emoji.props ? (
        <div className="fixed z-50" style={{ left: emoji.coords.left, top: emoji.coords.top }}>
          <EmojiList ref={emojiRef} {...emoji.props} />
        </div>
      ) : null}

      {editor && imageInput ? (
        <div className="fixed z-50" style={{ left: imageInput.coords.left, top: imageInput.coords.top }}>
          <ImageInput
            editor={editor}
            position={imageInput.position}
            onUpload={onUpload}
            onClose={() => setImageInput(null)}
          />
        </div>
      ) : null}

      {editor && bookmarkInput ? (
        <div className="fixed z-50" style={{ left: bookmarkInput.coords.left, top: bookmarkInput.coords.top }}>
          <BookmarkInput editor={editor} position={bookmarkInput.position} onClose={() => setBookmarkInput(null)} />
        </div>
      ) : null}

      {editor && pasteMenu ? (
        <div className="fixed z-50" style={{ left: pasteMenu.coords.left, top: pasteMenu.coords.top }}>
          <PasteMenu editor={editor} url={pasteMenu.url} position={pasteMenu.position} onClose={closeMenus} />
        </div>
      ) : null}
    </div>
  );
});

/** Build menu state with a flip-above-when-cramped position from the suggestion's rect. */
function menuFrom<T>(props: SuggestionProps<T>): MenuState<T> {
  const rect = props.clientRect?.();
  if (!rect) return { props, coords: { left: 0, top: 0 } };
  const menuHeight = 320;
  const spaceBelow = window.innerHeight - rect.bottom;
  const top = spaceBelow < menuHeight && rect.top > spaceBelow ? rect.top - menuHeight - 8 : rect.bottom + 8;
  return { props, coords: { left: rect.left, top } };
}
