// libs/vortex-react/src/editor/index.ts
// Public surface of the React editor — parity with the Svelte package (Phase 6).
export { Editor, getEditorCounts, type EditorProps, type EditorHandle } from './Editor';
export { Reader, type ReaderProps } from './Reader';
export type {
  EditorCounts,
  MentionItem,
  ImageUploadResult,
  SlashCommandItem,
  UrlMentionAttributes,
  LinkPreviewAttributes,
} from '@cloudvoyant/vortex-ui';
