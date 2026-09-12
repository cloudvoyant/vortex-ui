// libs/vortex-ui/src/editor/types.ts
// Framework-agnostic contracts shared by the Svelte and React editor packages.
//
// This module must stay free of `svelte` and `react` imports: the Svelte and React packages
// each consume these types and supply their own node-view renderers (see EditorNodeViews).
import type { Editor, Range } from '@tiptap/core';
import type { SuggestionOptions } from '@tiptap/suggestion';

export interface EditorCounts {
  wordCount: number;
  charCount: number;
  /** Rough page estimate (words / 300), floored at 1. */
  pageCount: number;
  /** Estimated reading time in minutes (words / 250), floored at 1. */
  readDuration: number;
}

export interface MentionItem {
  id: string;
  label: string;
  /** e.g. "post" | "series" | "user" */
  type: string;
  seriesId?: string | null;
  title?: string;
}

/**
 * A suggestion-list element the framework menus augment with their own keydown handler, so the
 * Tiptap suggestion bridge can delegate arrow/Enter handling to the mounted menu.
 */
export interface MentionListElement extends HTMLElement {
  __mentionListKeyDown?: (event: KeyboardEvent) => boolean;
}

/** One emoji suggestion entry (matches @tiptap/extension-emoji's item shape). */
export interface EmojiItem {
  name: string;
  emoji: string;
}

export interface UrlMentionAttributes {
  url: string;
  title: string;
  favicon: string | null;
}

export interface LinkPreviewAttributes {
  url: string;
  title: string;
  description: string;
  image: string | null;
  favicon: string | null;
  provider: string;
  type: 'bookmark' | 'embed';
}

export interface ImageUploadResult {
  src: string;
  srcset?: string;
}

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
  category: 'suggested' | 'basic' | 'media' | 'advanced';
  shortcut?: string;
}

/**
 * A zero-argument `addNodeView` implementation, produced per framework by binding a component
 * to that framework's node-view renderer (`SvelteNodeViewRenderer` / `ReactNodeViewRenderer`).
 * Passing it in pre-bound keeps `vortex-ui` free of any framework import.
 */
export type NodeViewFactory = () => ReturnType<NonNullable<import('@tiptap/core').NodeConfig['addNodeView']>>;

/** The per-framework node views the editor needs. */
export interface EditorNodeViews {
  image: NodeViewFactory;
  urlMention: NodeViewFactory;
  linkPreview: NodeViewFactory;
  codeBlock: NodeViewFactory;
  notice?: NodeViewFactory;
  mermaid?: NodeViewFactory;
}

/**
 * App-specific seams. These replace behaviour the source editor hardcoded, so the component
 * stays app-agnostic: mention search (was a fixed `/api/search/internal` fetch), internal-link
 * hrefs (were fixed `/read/...` paths), and image upload (was an app-specific endpoint).
 */
export interface EditorSeams {
  /** Replaces the source editor's hardcoded internal-search fetch. */
  mentionSource?: (query: string) => Promise<MentionItem[]>;
  /** Replaces the source editor's hardcoded `/read/...` href construction. */
  hrefBuilder?: (item: MentionItem) => string;
  /** Replaces the app-specific image upload. */
  onUpload?: (file: File) => Promise<ImageUploadResult>;
}

export interface BuildExtensionsOptions extends EditorSeams {
  nodeViews: EditorNodeViews;
  /** Placeholder resolver; defaults to "Untitled" for the H1 and "Type '/' for commands". */
  placeholder?: (nodeName: string, level?: number) => string;
  /** Mounts the framework's mention suggestion menu. */
  mentionRender?: SuggestionOptions<MentionItem>['render'];
  /** Mounts the framework's slash-command menu. */
  slashRender?: SuggestionOptions<SlashCommandItem>['render'];
  /** Mounts the framework's emoji (`:`) picker menu. */
  emojiRender?: SuggestionOptions<EmojiItem>['render'];
  /**
   * The read-only Reader uses heading ids so headings are anchor-linkable; the editor uses the
   * plain heading. When true, StarterKit's heading is disabled and HeadingWithId is used.
   */
  headingWithId?: boolean;
}
