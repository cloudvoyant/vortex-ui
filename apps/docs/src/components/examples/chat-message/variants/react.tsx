// apps/docs/src/components/examples/chat-message/variants/react.tsx
import { ChatMessage } from '@cloudvoyant/vortex-react';

export default function ReactChatMessageVariants() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <ChatMessage variant="default" from="User A" at={new Date('2026-09-05T14:32:00')}>
        A message from another user (default).
      </ChatMessage>
      <ChatMessage variant="user" from="You" at={new Date('2026-09-05T14:33:00')}>
        A message you sent (user).
      </ChatMessage>
      <ChatMessage variant="agent" from="Assistant" at={new Date('2026-09-05T14:34:00')}>
        A message from the AI agent (agent).
      </ChatMessage>
      <ChatMessage variant="user" from="You" at={new Date('2026-09-05T14:35:00')} state="sending">
        A message currently sending…
      </ChatMessage>
    </div>
  );
}
