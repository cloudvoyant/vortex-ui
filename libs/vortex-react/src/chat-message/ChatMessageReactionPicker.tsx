// libs/vortex-react/src/chat-message/ChatMessageReactionPicker.tsx
// Composed for vortex-ui on the vortex Popover; emoji grid or thumbs up/down picker.
import { SmilePlus, ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  chatReactionPickerTriggerBase,
  chatReactionPickerGridBase,
  chatReactionPickerButtonBase,
  chatReactionRateBase,
  chatReactionRateButtonBase,
  DEFAULT_CHAT_EMOJIS,
  THUMBS_UP_KEY,
  THUMBS_DOWN_KEY,
  cn,
} from '@cloudvoyant/vortex-ui';
import type { ChatReactionPickerVariant } from '@cloudvoyant/vortex-ui';
import { Popover, PopoverTrigger, PopoverContent, usePopoverContext } from '../popover';

export interface ChatMessageReactionPickerProps {
  variant?: ChatReactionPickerVariant;
  emojis?: readonly string[];
  onReact?: (key: string) => void;
  className?: string;
}

function EmojiGrid({ emojis, onReact }: { emojis: readonly string[]; onReact?: (key: string) => void }) {
  const popover = usePopoverContext();
  return (
    <div className={chatReactionPickerGridBase} role="menu" aria-label="Add reaction">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          role="menuitem"
          className={chatReactionPickerButtonBase}
          data-emoji={emoji}
          aria-label={emoji}
          onClick={() => {
            onReact?.(emoji);
            popover.setOpen(false);
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

function RatePicker({ onReact }: { onReact?: (key: string) => void }) {
  const popover = usePopoverContext();
  return (
    <div className={chatReactionRateBase} role="menu" aria-label="Rate">
      <button
        type="button"
        role="menuitem"
        className={chatReactionRateButtonBase}
        data-reaction={THUMBS_UP_KEY}
        aria-label="Thumbs up"
        onClick={() => {
          onReact?.(THUMBS_UP_KEY);
          popover.setOpen(false);
        }}
      >
        <ThumbsUp className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        role="menuitem"
        className={chatReactionRateButtonBase}
        data-reaction={THUMBS_DOWN_KEY}
        aria-label="Thumbs down"
        onClick={() => {
          onReact?.(THUMBS_DOWN_KEY);
          popover.setOpen(false);
        }}
      >
        <ThumbsDown className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function ChatMessageReactionPicker({
  variant = 'emoji',
  emojis = DEFAULT_CHAT_EMOJIS,
  onReact,
  className,
}: ChatMessageReactionPickerProps) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(chatReactionPickerTriggerBase, className)}
        aria-label="Add reaction"
        data-reaction-picker={variant}
      >
        <SmilePlus className="size-4" aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2">
        {variant === 'rate' ? <RatePicker onReact={onReact} /> : <EmojiGrid emojis={emojis} onReact={onReact} />}
      </PopoverContent>
    </Popover>
  );
}
