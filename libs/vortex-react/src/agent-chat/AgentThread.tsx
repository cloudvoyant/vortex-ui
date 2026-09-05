// libs/vortex-react/src/agent-chat/AgentThread.tsx
// Composed for vortex-ui; a virtualized thread for agentic chat. Agent messages
// render sanitized markdown; user/default messages render plain text. Uses
// @tanstack/react-virtual — long threads only mount visible rows.
import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { chatThreadBase, chatMarkdownProseBase, cn } from '@cloudvoyant/vortex-ui';
import type { AgenticMessage } from '@cloudvoyant/vortex-ui';
import { ChatMessage } from '../chat-message';
import { useChatMarkdown } from './use-chat-markdown';

export interface AgentThreadProps {
  messages: AgenticMessage[];
  onScrollTop?: () => void;
  className?: string;
  estimateSize?: number;
}

function MessageRow({ message }: { message: AgenticMessage }) {
  const html = message.variant === 'agent' ? useChatMarkdown(message.content) : null;
  return (
    <ChatMessage variant={message.variant} from={message.from} at={message.at}>
      {message.variant === 'agent' ? (
        html === null ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <div
            className={chatMarkdownProseBase}
            data-chat-markdown
            // pi-lens-ignore: dangerously-set-inner-html
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      ) : (
        message.content
      )}
    </ChatMessage>
  );
}

export function AgentThread({ messages, onScrollTop, className, estimateSize = 72 }: AgentThreadProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 6,
  });

  const handleScroll = () => {
    const el = parentRef.current;
    if (el && el.scrollTop <= 0) onScrollTop?.();
  };

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className={cn(chatThreadBase, 'relative overflow-y-auto', className)}
      data-agent-thread
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => {
          const message = messages[item.index];
          return (
            <div
              key={message.id}
              data-index={item.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${item.start}px)`,
              }}
            >
              <MessageRow message={message} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
