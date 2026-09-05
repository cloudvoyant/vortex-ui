// apps/docs/src/components/examples/chat/typing-indicator/react.tsx
import { Chat, ChatThread, ChatMessage, ChatTypingIndicator, ChatInput } from '@cloudvoyant/vortex-react';

export default function ReactChatTypingIndicator() {
  return (
    <Chat layout="slack" className="mx-auto h-96 w-full max-w-md">
      <ChatThread>
        <ChatMessage variant="user" from="You" at={new Date('2024-01-01T09:00:00')}>
          Are you around?
        </ChatMessage>
        <ChatMessage variant="default" from="Ada" at={new Date('2024-01-01T09:00:20')}>
          Yes — one sec.
        </ChatMessage>
      </ChatThread>
      <ChatTypingIndicator label="Ada is typing" />
      <ChatInput placeholder="Message…" onSend={() => {}} />
    </Chat>
  );
}
