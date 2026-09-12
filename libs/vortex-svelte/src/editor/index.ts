// libs/vortex-svelte/src/editor/index.ts
// Public surface of the Svelte editor. Matches the React package's surface (Phase 7).
export { default as Editor } from './Editor.svelte';
export { default as Reader } from './Reader.svelte';
export type {
  EditorCounts,
  MentionItem,
  ImageUploadResult,
  SlashCommandItem,
  UrlMentionAttributes,
  LinkPreviewAttributes,
} from '@cloudvoyant/vortex-ui';
