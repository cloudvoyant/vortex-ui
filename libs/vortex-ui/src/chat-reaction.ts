// libs/vortex-ui/src/chat-reaction.ts
// Composed for vortex-ui; base classes for the ChatMessage reaction chips and
// the emoji/rate reaction picker. Themed via shadcn --border/--muted/--foreground.

export const chatReactionListBase = 'mt-1 flex flex-wrap items-center gap-1';
export const chatReactionChipBase =
  'inline-flex items-center gap-1 rounded-full border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground transition-colors hover:bg-muted';
export const chatReactionChipActiveBase = 'border-primary bg-primary/10 text-foreground';
export const chatReactionPickerTriggerBase =
  'inline-flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';
export const chatReactionPickerGridBase = 'grid grid-cols-4 gap-1';
export const chatReactionPickerButtonBase =
  'inline-flex size-8 items-center justify-center rounded-md text-lg leading-none transition-colors hover:bg-muted';
export const chatReactionRateBase = 'flex items-center gap-1';
export const chatReactionRateButtonBase =
  'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground';

export const THUMBS_UP_KEY = 'thumbs-up';
export const THUMBS_DOWN_KEY = 'thumbs-down';

export const DEFAULT_CHAT_EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢', '🙏', '🔥'] as const;

export type ChatReactionPickerVariant = 'emoji' | 'rate';

export interface ChatReactionPickerProps {
  variant?: ChatReactionPickerVariant;
  emojis?: readonly string[];
  className?: string;
}
