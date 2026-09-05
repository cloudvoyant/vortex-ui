// libs/vortex-ui/src/chat-message.ts
// Composed for vortex-ui on @ark-ui/react/factory; no upstream chat primitive.
// cva variants + shared prop types for the ChatMessage family. Themed via the
// shadcn --primary/--muted/--card/--border/--danger variables (no new tokens).
import { cva, type VariantProps } from 'class-variance-authority';

export type ChatLayout = 'slack' | 'ios' | 'minimal';
export type ChatMessageVariant = 'default' | 'user' | 'agent';
export type ChatMessageState = 'sent' | 'sending' | 'error';

export const chatMessageRowVariants = cva('flex w-full gap-2', {
  variants: {
    layout: {
      slack: 'flex-row justify-start',
      ios: 'flex-row',
      minimal: 'flex-row justify-start',
    },
    variant: {
      default: '',
      user: '',
      agent: '',
    },
  },
  compoundVariants: [
    { layout: 'ios', variant: 'user', className: 'justify-end' },
    { layout: 'ios', variant: 'default', className: 'justify-start' },
    { layout: 'ios', variant: 'agent', className: 'justify-start' },
  ],
  defaultVariants: { layout: 'slack', variant: 'default' },
});

export type ChatMessageRowVariants = VariantProps<typeof chatMessageRowVariants>;

export const chatMessageContentVariants = cva('flex min-w-0 flex-col gap-1', {
  variants: {
    layout: {
      slack: 'items-start',
      ios: '',
      minimal: 'items-start',
    },
    variant: { default: '', user: '', agent: '' },
  },
  compoundVariants: [{ layout: 'ios', variant: 'user', className: 'items-end' }],
  defaultVariants: { layout: 'slack', variant: 'default' },
});

export const chatMessageBubbleVariants = cva(
  'inline-block max-w-prose whitespace-pre-wrap break-words text-sm leading-relaxed',
  {
    variants: {
      layout: {
        slack: 'rounded-md bg-transparent px-0 py-0 text-foreground',
        ios: 'rounded-2xl px-3 py-2',
        minimal: 'rounded-md bg-transparent px-0 py-0 text-foreground',
      },
      variant: { default: '', user: '', agent: '' },
      state: {
        sent: '',
        sending: 'opacity-60',
        error: '',
      },
    },
    compoundVariants: [
      { layout: 'ios', variant: 'user', className: 'bg-primary text-primary-foreground' },
      { layout: 'ios', variant: 'default', className: 'bg-muted text-foreground' },
      { layout: 'ios', variant: 'agent', className: 'border border-border bg-card text-card-foreground' },
      { layout: 'slack', state: 'error', className: 'text-danger' },
      { layout: 'minimal', state: 'error', className: 'text-danger' },
    ],
    defaultVariants: { layout: 'slack', variant: 'default', state: 'sent' },
  },
);

export type ChatMessageBubbleVariants = VariantProps<typeof chatMessageBubbleVariants>;

export const chatMessageMetaBase = 'flex items-baseline gap-2';
export const chatMessageAuthorBase = 'text-xs font-semibold text-foreground';
export const chatMessageTimeBase = 'text-xs text-muted-foreground';
export const chatMessageAttachmentsBase = 'mt-1 flex flex-col gap-1';
export const chatMessageAttachmentBase =
  'flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground';

export interface ChatMessageAttachment {
  id: string;
  name: string;
  size?: number;
}

export type ChatReactions = Record<string, number>;

export interface ChatMessageProps {
  variant?: ChatMessageVariant;
  from?: string;
  at?: Date;
  state?: ChatMessageState;
  reactions?: ChatReactions;
  attachments?: ChatMessageAttachment[];
  className?: string;
}
