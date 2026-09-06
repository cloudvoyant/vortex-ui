// apps/docs/src/components/examples/chat/default/react.tsx
import { useState } from 'react';
import { Chat, ChatThread, ChatMessage, ChatInput } from '@cloudvoyant/vortex-react';

interface SentMessage {
  id: string;
  text: string;
}

export default function ReactChatDefault() {
  const [sent, setSent] = useState<SentMessage[]>([]);
  const handleSend = (submit: { text: string }) => {
    const text = submit.text.trim();
    if (!text) return;
    setSent((prev) => [...prev, { id: `m-${Date.now()}`, text }]);
  };
  return (
    <Chat layout="slack" className="mx-auto h-96 w-full max-w-md">
      <ChatThread>
        <ChatMessage variant="default" from="Ada" at={new Date('2024-01-01T09:00:00')}>
          Morning! Did the deploy finish?
        </ChatMessage>
        <ChatMessage variant="user" from="You" at={new Date('2024-01-01T09:01:00')}>
          Yep, green across the board.
        </ChatMessage>
        <ChatMessage variant="default" from="Ada" at={new Date('2024-01-01T09:02:00')}>
          🎉
        </ChatMessage>
        {sent.map((m) => (
          <ChatMessage key={m.id} variant="user" from="You" at={new Date()}>
            {m.text}
          </ChatMessage>
        ))}
      </ChatThread>
      <ChatInput placeholder="Message the team…" onSend={handleSend} />
    </Chat>
  );
}
