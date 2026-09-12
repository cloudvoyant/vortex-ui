<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Editor, type EditorOptions } from '@tiptap/core';
  import { SvelteNodeViewRenderer } from 'svelte-tiptap';
  import {
    buildExtensions,
    registerImageInsertCallback,
    unregisterImageInsertCallback,
    type SlashCommandItem,
    type MentionItem,
    type MentionListElement,
    type EmojiItem,
    type EditorCounts,
    type ImageUploadResult,
  } from '@cloudvoyant/vortex-ui';
  import BubbleMenuContent from './BubbleMenu.svelte';
  import SlashMenu from './SlashMenu.svelte';
  import BookmarkInput from './BookmarkInput.svelte';
  import ImageInput from './ImageInput.svelte';
  import PasteMenu from './PasteMenu.svelte';
  import ImageNodeView from './ImageNodeView.svelte';
  import UrlMentionPill from './UrlMentionPill.svelte';
  import LinkPreviewCard from './LinkPreviewCard.svelte';
  import CodeBlockComponent from './CodeBlockComponent.svelte';
  import MentionList from './MentionList.svelte';
  import EmojiList from './EmojiList.svelte';
  import type { SuggestionProps } from '@tiptap/suggestion';
  import type { JSONContent } from '@tiptap/core';

  let {
    content = '',
    editable = true,
    onchange,
    mentionSource,
    hrefBuilder,
    onUpload,
  }: {
    content?: string;
    editable?: boolean;
    onchange?: (data: { content: string; title: string }) => void;
    /** Seam: replaces the source editor's hardcoded internal-search endpoint. */
    mentionSource?: (query: string) => Promise<MentionItem[]>;
    /** Seam: replaces the source editor's hardcoded /read/... hrefs. */
    hrefBuilder?: (item: MentionItem) => string;
    /** Seam: replaces the source editor's app-specific image upload. */
    onUpload?: (file: File) => Promise<ImageUploadResult>;
  } = $props();

  let editor = $state<Editor | null>(null);
  let element: HTMLDivElement;
  let slashMenuProps = $state<SuggestionProps<SlashCommandItem> | null>(null);
  // The mention menu renders from the template (like the slash menu) rather than being mounted
  // into document.body: that is the pattern already proven to work in this component, and it
  // keeps keydown delegation on a bound element instead of a detached mount.
  let mentionMenuProps = $state<SuggestionProps<MentionItem> | null>(null);
  let mentionMenuCoords = $state({ left: 0, top: 0 });
  let mentionMenuEl = $state<HTMLElement | null>(null);
  // Emoji picker: same template-render pattern. Without a render, `:` silently does nothing.
  let emojiMenuProps = $state<SuggestionProps<EmojiItem> | null>(null);
  let emojiMenuCoords = $state({ left: 0, top: 0 });
  let emojiMenuEl = $state<HTMLElement | null>(null);
  let slashMenuCoords = $state({ left: 0, top: 0 });
  let bookmarkInputActive = $state(false);
  let bookmarkInputPosition = $state(0);
  let bookmarkInputCoords = $state({ left: 0, top: 0 });
  let imageInputActive = $state(false);
  let imageInputPosition = $state(0);
  let imageInputCoords = $state({ left: 0, top: 0 });
  let pasteMenuActive = $state(false);
  let pasteMenuUrl = $state('');
  let pasteMenuPosition = $state(0);
  let pasteMenuCoords = $state({ left: 0, top: 0 });

  function updateSlashMenuPosition() {
    const props = slashMenuProps;
    if (!props) return;
    const rect = props.clientRect?.();
    if (!rect || rect.left === undefined || rect.top === undefined) return;

    const itemCount = props.items?.length || 0;
    const menuHeight = Math.min(itemCount * 36 + 8, 320);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < menuHeight && rect.top > spaceBelow ? rect.top - menuHeight - 8 : rect.bottom + 8;
    slashMenuCoords = { left: rect.left, top };
  }

  // Reposition on every suggestion update and while any ancestor scrolls, so a fixed menu remains
  // attached to the slash cursor rather than being left behind in the viewport.
  $effect(() => {
    if (slashMenuProps) updateSlashMenuPosition();
  });

  $effect(() => {
    if (!slashMenuProps) return;
    window.addEventListener('scroll', updateSlashMenuPosition, true);
    window.addEventListener('resize', updateSlashMenuPosition);
    return () => {
      window.removeEventListener('scroll', updateSlashMenuPosition, true);
      window.removeEventListener('resize', updateSlashMenuPosition);
    };
  });

  // Extract title from content (first H1)
  function extractTitle(json: JSONContent): string {
    if (json && json.content && json.content[0]?.type === 'heading' && json.content[0]?.attrs?.level === 1) {
      return json.content[0]?.content?.[0]?.text || '';
    }
    return '';
  }

  onMount(() => {
    // Cleanup any existing editor first (helps with hot reload)
    if (editor) {
      editor.destroy();
      editor = null;
    }

    editor = new Editor({
      element,
      ...({ immediatelyRender: false } as unknown as Partial<EditorOptions>),
      extensions: buildExtensions({
        mentionSource,
        hrefBuilder,
        nodeViews: {
          image: () => SvelteNodeViewRenderer(ImageNodeView),
          urlMention: () => SvelteNodeViewRenderer(UrlMentionPill),
          linkPreview: () => SvelteNodeViewRenderer(LinkPreviewCard),
          codeBlock: () => SvelteNodeViewRenderer(CodeBlockComponent),
        },
        mentionRender: () => ({
          onStart: (props: SuggestionProps<MentionItem>) => {
            mentionMenuProps = props;
            const rect = props.clientRect?.();
            if (rect) mentionMenuCoords = { left: rect.left, top: rect.bottom + 8 };
          },
          onUpdate: (props: SuggestionProps<MentionItem>) => {
            mentionMenuProps = props;
            const rect = props.clientRect?.();
            if (rect) mentionMenuCoords = { left: rect.left, top: rect.bottom + 8 };
          },
          onKeyDown: (props: { event: KeyboardEvent }) => {
            if (props.event.key === 'Escape') {
              props.event.preventDefault();
              props.event.stopPropagation();
              return true;
            }
            // MentionList exposes its handler on the element (see its $effect).
            const child = mentionMenuEl?.firstElementChild as MentionListElement | null;
            return child?.__mentionListKeyDown?.(props.event) ?? false;
          },
          onExit: () => {
            mentionMenuProps = null;
          },
        }),
        // The slash menu is rendered from this component's template (see `slashMenuProps`).
        emojiRender: () => ({
          onStart: (props: SuggestionProps<EmojiItem>) => {
            emojiMenuProps = props;
            const rect = props.clientRect?.();
            if (rect) emojiMenuCoords = { left: rect.left, top: rect.bottom + 8 };
          },
          onUpdate: (props: SuggestionProps<EmojiItem>) => {
            emojiMenuProps = props;
            const rect = props.clientRect?.();
            if (rect) emojiMenuCoords = { left: rect.left, top: rect.bottom + 8 };
          },
          onKeyDown: (props: { event: KeyboardEvent }) => {
            if (props.event.key === 'Escape') {
              props.event.preventDefault();
              props.event.stopPropagation();
              return true;
            }
            const child = emojiMenuEl?.firstElementChild as MentionListElement | null;
            return child?.__mentionListKeyDown?.(props.event) ?? false;
          },
          onExit: () => {
            emojiMenuProps = null;
          },
        }),
        slashRender: () => ({
          onStart: (props: SuggestionProps<SlashCommandItem>) => {
            slashMenuProps = props;
          },
          onUpdate: (props: SuggestionProps<SlashCommandItem>) => {
            slashMenuProps = props;
          },
          onExit: () => {
            slashMenuProps = null;
          },
        }),
      }),
      content: content
        ? JSON.parse(content)
        : {
            type: 'doc',
            content: [
              {
                type: 'heading',
                attrs: { level: 1 },
                content: [],
              },
              {
                type: 'paragraph',
                content: [],
              },
            ],
          },
      editable,
      onUpdate: ({ editor }) => {
        const json = editor.getJSON();
        const title = extractTitle(json);
        const contentStr = JSON.stringify(json);
        onchange?.({ content: contentStr, title });
      },
      editorProps: {
        attributes: {
          class: 'prose prose-lg focus:outline-none max-w-none min-h-[500px]',
        },
        handlePaste: (view, event) => {
          // Get pasted text
          const text = event.clipboardData?.getData('text/plain') || '';

          // Check if it's a URL
          const urlRegex = /^https?:\/\/.+/i;
          if (!urlRegex.test(text.trim())) {
            return false; // Let default paste behavior handle it
          }

          // Prevent default paste
          event.preventDefault();

          // Get current position
          const { from } = view.state.selection;

          // Insert URL text temporarily
          editor?.chain().focus().insertContent(text).run();

          // Calculate position for paste menu with flip logic
          const coords = view.coordsAtPos(from);
          const menuHeight = 150; // approximate height of paste menu
          const spaceBelow = window.innerHeight - coords.bottom;
          const spaceAbove = coords.top;

          const top =
            spaceBelow < menuHeight && spaceAbove > spaceBelow ? coords.top - menuHeight - 8 : coords.bottom + 8;

          pasteMenuCoords = {
            left: coords.left,
            top,
          };

          // Show paste menu
          pasteMenuUrl = text.trim();
          pasteMenuPosition = from;
          pasteMenuActive = true;

          return true; // Handled
        },
      },
    });

    // Register callback so the image slash command can directly set Svelte state
    // (editor.storage mutations are not tracked by Svelte 5 $effect)
    registerImageInsertCallback(editor!, (position) => {
      const coords = editor!.view.coordsAtPos(position);
      const menuHeight = 300;
      const spaceBelow = window.innerHeight - coords.bottom;
      const spaceAbove = coords.top;
      const top = spaceBelow < menuHeight && spaceAbove > spaceBelow ? coords.top - menuHeight - 8 : coords.bottom + 8;
      imageInputCoords = { left: coords.left, top };
      imageInputPosition = position;
      imageInputActive = true;
    });
  });

  interface BookmarkInputState {
    active: boolean;
    position: number;
  }

  function isBookmarkInputState(v: unknown): v is BookmarkInputState {
    return typeof v === 'object' && v !== null && 'active' in v;
  }

  // Watch for bookmark input trigger
  $effect(() => {
    if (!editor?.view) return;

    const storage = editor.storage as unknown as Record<string, unknown>;
    const bookmarkInput = storage['bookmarkInput'];
    if (isBookmarkInputState(bookmarkInput) && bookmarkInput.active) {
      const pos = bookmarkInput.position;
      bookmarkInputPosition = pos;

      // Calculate position using coordsAtPos
      const coords = editor.view.coordsAtPos(pos);
      bookmarkInputCoords = {
        left: coords.left,
        top: coords.bottom + 8,
      };

      bookmarkInputActive = true;

      // Reset the trigger
      storage['bookmarkInput'] = { active: false };
    }
  });

  onDestroy(() => {
    if (editor) {
      unregisterImageInsertCallback(editor);
      editor.destroy();
    }
  });

  // Update editable state
  $effect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  });

  // Expose method to update content externally
  export function updateContent(newContent: string) {
    if (editor && newContent !== JSON.stringify(editor.getJSON())) {
      try {
        const parsed = JSON.parse(newContent);
        editor.commands.setContent(parsed);
      } catch (e) {
        console.error('Failed to parse content:', e);
      }
    }
  }

  // Expose focus method
  export function focus() {
    if (editor) {
      editor.commands.focus('start');
    }
  }

  // Expose method to get analytics counts
  export function getCounts(): EditorCounts {
    if (!editor) {
      return { wordCount: 0, charCount: 0, pageCount: 0, readDuration: 0 };
    }

    const wordCount = editor.storage.characterCount?.words() || 0;
    const charCount = editor.storage.characterCount?.characters() || 0;
    const pageCount = Math.max(1, Math.ceil(wordCount / 300));
    const readDuration = Math.max(1, Math.ceil(wordCount / 250));

    return { wordCount, charCount, pageCount, readDuration };
  }
</script>

<div class="relative">
  <div bind:this={element}></div>
  {#if editor}
    <BubbleMenuContent {editor} />
    {#if slashMenuProps}
      <div class="fixed z-50" style="left: {slashMenuCoords.left}px; top: {slashMenuCoords.top}px;">
        <SlashMenu items={slashMenuProps.items || []} command={(item) => slashMenuProps?.command?.(item)} />
      </div>
    {/if}
    {#if mentionMenuProps}
      <div
        bind:this={mentionMenuEl}
        class="fixed z-50"
        style="left: {mentionMenuCoords.left}px; top: {mentionMenuCoords.top}px;"
      >
        <MentionList
          items={mentionMenuProps.items || []}
          command={(item) => mentionMenuProps?.command?.(item)}
          clientRect={mentionMenuProps.clientRect ?? null}
        />
      </div>
    {/if}
    {#if emojiMenuProps}
      <div
        bind:this={emojiMenuEl}
        class="fixed z-50"
        style="left: {emojiMenuCoords.left}px; top: {emojiMenuCoords.top}px;"
      >
        <EmojiList
          items={emojiMenuProps.items || []}
          command={(item) => emojiMenuProps?.command?.(item)}
          clientRect={emojiMenuProps.clientRect ?? null}
        />
      </div>
    {/if}
    {#if bookmarkInputActive}
      <div class="fixed z-50" style="left: {bookmarkInputCoords.left}px; top: {bookmarkInputCoords.top}px;">
        <BookmarkInput
          {editor}
          position={bookmarkInputPosition}
          onClose={() => {
            bookmarkInputActive = false;
          }}
        />
      </div>
    {/if}
    {#if imageInputActive}
      <div class="fixed z-50" style="left: {imageInputCoords.left}px; top: {imageInputCoords.top}px;">
        <ImageInput
          {editor}
          {onUpload}
          position={imageInputPosition}
          onClose={() => {
            imageInputActive = false;
          }}
        />
      </div>
    {/if}
    {#if pasteMenuActive}
      <div class="fixed z-50" style="left: {pasteMenuCoords.left}px; top: {pasteMenuCoords.top}px;">
        <PasteMenu
          {editor}
          url={pasteMenuUrl}
          position={pasteMenuPosition}
          onClose={() => {
            pasteMenuActive = false;
          }}
        />
      </div>
    {/if}
  {/if}
</div>

<style>
  /* Text alignment - applies to both editor and read view */
  :global([data-text-align='left']),
  :global(.ProseMirror [data-text-align='left']) {
    text-align: left !important;
  }

  :global([data-text-align='center']),
  :global(.ProseMirror [data-text-align='center']) {
    text-align: center !important;
  }

  :global([data-text-align='right']),
  :global(.ProseMirror [data-text-align='right']) {
    text-align: right !important;
  }

  :global([data-text-align='justify']),
  :global(.ProseMirror [data-text-align='justify']) {
    text-align: justify !important;
  }

  /* Text colors - theme-aware */
  :global(.ProseMirror span[data-color='red']) {
    color: var(--text-red);
  }
  :global(.ProseMirror span[data-color='orange']) {
    color: var(--text-orange);
  }
  :global(.ProseMirror span[data-color='yellow']) {
    color: var(--text-yellow);
  }
  :global(.ProseMirror span[data-color='green']) {
    color: var(--text-green);
  }
  :global(.ProseMirror span[data-color='cyan']) {
    color: var(--text-cyan);
  }
  :global(.ProseMirror span[data-color='blue']) {
    color: var(--text-blue);
  }
  :global(.ProseMirror span[data-color='violet']) {
    color: var(--text-violet);
  }
  :global(.ProseMirror span[data-color='fuchsia']) {
    color: var(--text-fuchsia);
  }
  :global(.ProseMirror span[data-color='slate']) {
    color: var(--text-slate);
  }

  /* Default highlight (no color specified) */
  :global(.ProseMirror mark) {
    background-color: var(--highlight-yellow) !important;
    color: inherit !important;
  }

  /* Highlight colors - theme-aware */
  :global(.ProseMirror mark[data-color='yellow']) {
    background-color: var(--highlight-yellow) !important;
    color: inherit !important;
  }
  :global(.ProseMirror mark[data-color='blue']) {
    background-color: var(--highlight-blue) !important;
    color: inherit !important;
  }
  :global(.ProseMirror mark[data-color='green']) {
    background-color: var(--highlight-green) !important;
    color: inherit !important;
  }
  :global(.ProseMirror mark[data-color='red']) {
    background-color: var(--highlight-red) !important;
    color: inherit !important;
  }
  :global(.ProseMirror mark[data-color='fuchsia']) {
    background-color: var(--highlight-fuchsia) !important;
    color: inherit !important;
  }
  :global(.ProseMirror mark[data-color='orange']) {
    background-color: var(--highlight-orange) !important;
    color: inherit !important;
  }
  :global(.ProseMirror mark[data-color='violet']) {
    background-color: var(--highlight-violet) !important;
    color: inherit !important;
  }
  :global(.ProseMirror mark[data-color='cyan']) {
    background-color: var(--highlight-cyan) !important;
    color: inherit !important;
  }
  :global(.ProseMirror mark[data-color='slate']) {
    background-color: var(--highlight-slate) !important;
    color: inherit !important;
  }

  /* Code block syntax highlighting */
  :global(.ProseMirror pre) {
    background-color: var(--code-block-bg);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
    font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Courier New', monospace;
    font-size: calc(var(--base-font-size, 16px) * 0.875);
    line-height: var(--line-height, 1.5);
    border: 1px solid var(--code-block-border, #e5e5e5);
  }

  :global(.ProseMirror pre code) {
    background: none;
    padding: 0;
    border-radius: 0;
    font-size: inherit;
    font-family: inherit;
  }

  /* ProseMirror container */
  :global(.ProseMirror) {
    position: relative;
  }

  /* List styling fixes */
  :global(.ProseMirror ul),
  :global(.ProseMirror ol) {
    padding-left: 1.25rem !important;
    margin: 1rem 0 !important;
  }

  :global(.ProseMirror li) {
    display: list-item !important;
    list-style-position: outside !important;
    margin: 0.25rem 0 !important;
    padding-left: 0.25rem !important;
  }

  :global(.ProseMirror ul > li) {
    list-style-type: disc !important;
  }

  :global(.ProseMirror ol > li) {
    list-style-type: decimal !important;
  }

  :global(.ProseMirror li p) {
    display: inline !important;
    margin: 0 !important;
  }

  :global(.ProseMirror ul[data-type='taskList']) {
    list-style-type: none !important;
    padding-left: 0 !important;
  }

  :global(.ProseMirror ul[data-type='taskList'] li) {
    display: flex !important;
    align-items: flex-start !important;
    gap: 0.5rem !important;
    list-style-type: none !important;
  }

  :global(.ProseMirror ul[data-type='taskList'] li > label) {
    flex-shrink: 0 !important;
    margin-top: 0.2rem !important;
  }

  :global(.ProseMirror ul[data-type='taskList'] li > div) {
    flex: 1 !important;
  }

  :global(.ProseMirror ul[data-type='taskList'] li p) {
    display: inline !important;
    margin: 0 !important;
  }

  /* Indent styles */
  :global(.ProseMirror .tt-indent-1) {
    margin-left: 2rem !important;
  }

  :global(.ProseMirror .tt-indent-2) {
    margin-left: 4rem !important;
  }

  :global(.ProseMirror .tt-indent-3) {
    margin-left: 6rem !important;
  }

  :global(.ProseMirror .tt-indent-4) {
    margin-left: 8rem !important;
  }

  :global(.ProseMirror .tt-indent-5) {
    margin-left: 10rem !important;
  }

  :global(.ProseMirror .tt-indent-6) {
    margin-left: 12rem !important;
  }

  :global(.ProseMirror .tt-indent-7) {
    margin-left: 14rem !important;
  }

  :global(.ProseMirror .tt-indent-8) {
    margin-left: 16rem !important;
  }

  /* Internal Mention - styled like regular links */
  :global(.ProseMirror a.internal-mention) {
    color: inherit;
    text-decoration: underline;
    cursor: text;
    user-select: text;
    -webkit-user-select: text;
  }

  :global(.ProseMirror a.internal-mention:hover) {
    opacity: 0.8;
  }

  /* URL Mention Pills in Editor */
  :global(.ProseMirror .url-mention-pill-edit) {
    background-color: var(--url-pill-bg);
  }

  :global(.ProseMirror .url-mention-pill-edit:hover) {
    background-color: var(--bookmark-bg-hover);
  }
</style>
