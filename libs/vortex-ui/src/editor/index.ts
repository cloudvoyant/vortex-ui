// libs/vortex-ui/src/editor/index.ts
// Framework-agnostic editor layer. The Svelte and React packages import from here and supply
// their own node-view renderers + suggestion menu mounts, so this module never imports
// svelte or react.
export * from './types';
export { buildExtensions } from './build-extensions';

export { TitleHeading } from './extensions/title-heading';
export { ExitHeading } from './extensions/exit-heading';
export { HeadingWithId } from './extensions/heading-with-id';
export {
  slashCommands,
  registerImageInsertCallback,
  unregisterImageInsertCallback,
  registerYouTubeInsertCallback,
  unregisterYouTubeInsertCallback,
} from './extensions/slash-commands';
export { createCodeBlockCustom } from './extensions/code-block-custom';
export { createImageNode } from './extensions/image-node';
export { createUrlMention } from './extensions/url-mention';
export { createLinkPreview } from './extensions/link-preview';
export { createInternalMention } from './extensions/internal-mention';
export { createNoticeNode, type NoticeAttributes, type NoticeVariant } from './extensions/notice-node';
export { createMermaidNode, type MermaidAttributes } from './extensions/mermaid-node';
