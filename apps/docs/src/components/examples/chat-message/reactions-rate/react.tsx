// apps/docs/src/components/examples/chat-message/reactions-rate/react.tsx
import { useState } from 'react';
import { ChatMessage, ChatMessageReactions, ChatMessageReactionPicker } from '@cloudvoyant/vortex-react';
import type { ChatReactions } from '@cloudvoyant/vortex-ui';

export default function ReactChatMessageReactionsRate() {
  const [reactions, setReactions] = useState<ChatReactions>({});
  const react = (key: string) => setReactions((r) => ({ ...r, [key]: (r[key] ?? 0) + 1 }));
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <ChatMessage variant="agent" from="Assistant" at={new Date('2026-09-05T14:41:00')}>
        Here is the refactored function. Let me know if this works for you.
      </ChatMessage>
      <div className="flex items-center gap-2">
        <ChatMessageReactions reactions={reactions} onReact={react} />
        <ChatMessageReactionPicker variant="rate" onReact={react} />
      </div>
    </div>
  );
}
