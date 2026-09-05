// libs/vortex-react/src/agent-chat/AgentStreamingMessage.tsx
// Composed for vortex-ui; renders the live streaming record as an agent message.
import { chatMarkdownProseBase, chatStreamingCursorBase, cn } from '@cloudvoyant/vortex-ui';
import type { AgentStreamingState } from '@cloudvoyant/vortex-ui';
import { ChatMessage } from '../chat-message';
import { useChatMarkdown } from './use-chat-markdown';

export interface AgentStreamingMessageProps {
  streaming: AgentStreamingState;
  from?: string;
  className?: string;
}

export function AgentStreamingMessage({ streaming, from = 'Agent', className }: AgentStreamingMessageProps) {
  const html = useChatMarkdown(streaming.content);
  if (streaming.status === 'Completed' || streaming.status === 'Cancelled') return null;
  const showCursor = streaming.status === 'Streaming' || streaming.status === 'Waiting';
  return (
    <ChatMessage variant="agent" from={from} className={className} data-streaming-status={streaming.status}>
      {streaming.content ? (
        html === null ? (
          <span className="whitespace-pre-wrap">{streaming.content}</span>
        ) : (
          <div
            className={chatMarkdownProseBase}
            data-chat-markdown
            // pi-lens-ignore: dangerously-set-inner-html
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )
      ) : (
        <span className="text-muted-foreground">{streaming.status === 'Retrying' ? 'Retrying…' : 'Thinking…'}</span>
      )}
      {showCursor && streaming.content ? <span className={cn(chatStreamingCursorBase)} aria-hidden="true" /> : null}
    </ChatMessage>
  );
}
