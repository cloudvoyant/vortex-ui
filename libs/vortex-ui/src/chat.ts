// libs/vortex-ui/src/chat.ts
// Composed for vortex-ui on @ark-ui/react/factory; no upstream chat primitive.
// Base classes for the Chat surface (root, thread, input, typing indicator).
// Themed via shadcn --background/--border/--muted/--primary variables (no new tokens).
import type { ChatLayout } from './chat-message';
import type { ChatMessageAttachment } from './chat-message';

export const chatRootBase =
  'flex h-full min-h-0 w-full flex-col overflow-hidden rounded-lg border border-border bg-background';

export const chatThreadBase = 'flex-1 min-h-0';
export const chatThreadContentBase = 'flex flex-col gap-4 p-4';

export const chatInputRootBase = 'flex flex-col gap-2 border-t border-border bg-background p-3';
export const chatInputRowBase = 'flex items-end gap-2';
export const chatInputTextareaBase = 'min-h-10 flex-1 resize-none';
export const chatInputAttachmentsBase = 'flex flex-wrap gap-1';
export const chatInputAttachmentChipBase =
  'inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground';
export const chatInputAttachmentRemoveBase =
  'inline-flex size-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';
export const chatInputAttachTriggerBase =
  'inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export const chatTypingIndicatorBase = 'flex items-center gap-1 px-4 py-2 text-muted-foreground';
export const chatTypingDotBase = 'inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground';

export interface ChatProps {
  layout?: ChatLayout;
  className?: string;
}

export interface ChatInputSubmit {
  text: string;
  attachments: ChatMessageAttachment[];
}
