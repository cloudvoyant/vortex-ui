// libs/vortex-react/src/chat-message/ChatMessageReactions.tsx
// Composed for vortex-ui; renders the reactions map as clickable chips.
import { chatReactionListBase, chatReactionChipBase, cn } from '@cloudvoyant/vortex-ui';
import type { ChatReactions } from '@cloudvoyant/vortex-ui';
import { reactionGlyph, reactionLabel } from './reaction-glyph';

export interface ChatMessageReactionsProps {
  reactions: ChatReactions;
  onReact?: (key: string) => void;
  className?: string;
}

export function ChatMessageReactions({ reactions, onReact, className }: ChatMessageReactionsProps) {
  const entries = Object.entries(reactions).filter(([, count]) => count > 0);
  if (entries.length === 0) return null;
  return (
    <div className={cn(chatReactionListBase, className)} role="group" aria-label="Reactions">
      {entries.map(([key, count]) => (
        <button
          key={key}
          type="button"
          className={chatReactionChipBase}
          data-reaction={key}
          aria-label={`${reactionLabel(key)}: ${count}`}
          onClick={() => onReact?.(key)}
        >
          {reactionGlyph(key)}
          <span>{count}</span>
        </button>
      ))}
    </div>
  );
}
