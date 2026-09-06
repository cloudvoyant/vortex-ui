// libs/vortex-react/src/chat/ChatTypingIndicator.tsx
// Composed for vortex-ui; three animated dots announcing that someone is typing.
import { chatTypingIndicatorBase, chatTypingDotBase, cn } from '@cloudvoyant/vortex-ui';

export interface ChatTypingIndicatorProps {
  className?: string;
  label?: string;
}

export function ChatTypingIndicator({ className, label = 'Someone is typing' }: ChatTypingIndicatorProps) {
  return (
    <div className={cn(chatTypingIndicatorBase, className)} role="status" aria-label={label} data-typing>
      <span className={chatTypingDotBase} style={{ animationDelay: '0ms' }} aria-hidden="true" />
      <span className={chatTypingDotBase} style={{ animationDelay: '150ms' }} aria-hidden="true" />
      <span className={chatTypingDotBase} style={{ animationDelay: '300ms' }} aria-hidden="true" />
    </div>
  );
}
