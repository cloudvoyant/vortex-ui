// apps/docs/src/components/examples/chat-message/reactions-emoji/react.tsx
import { useState } from 'react';
import { ChatMessage, ChatMessageReactions, ChatMessageReactionPicker } from '@cloudvoyant/vortex-react';
import type { ChatReactions } from '@cloudvoyant/vortex-ui';

export default function ReactChatMessageReactionsEmoji() {
  const [reactions, setReactions] = useState<ChatReactions>({ '👍': 2, '🎉': 1 });
  const react = (key: string) => setReactions((r) => ({ ...r, [key]: (r[key] ?? 0) + 1 }));
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <ChatMessage variant="default" from="User C" at={new Date('2026-09-05T14:40:00')}>
        Ship it! 🚀
      </ChatMessage>
      <div className="flex items-center gap-2">
        <ChatMessageReactions reactions={reactions} onReact={react} />
        <ChatMessageReactionPicker variant="emoji" onReact={react} />
      </div>
    </div>
  );
}
