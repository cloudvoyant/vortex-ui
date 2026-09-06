// apps/docs/src/components/examples/chat-message/default/react.tsx
import { ChatMessage } from '@cloudvoyant/vortex-react';

export default function ReactChatMessageDefault() {
  return (
    <div className="w-full max-w-md">
      <ChatMessage variant="default" from="User A" at={new Date('2026-09-05T14:32:00')}>
        Hey — did you get a chance to look at the PR?
      </ChatMessage>
    </div>
  );
}
