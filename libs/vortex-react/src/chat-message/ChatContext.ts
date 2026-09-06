// libs/vortex-react/src/chat-message/ChatContext.ts
// Composed for vortex-ui; supplies the chat layout to nested ChatMessage parts.
import { createContext, useContext } from 'react';
import type { ChatLayout } from '@cloudvoyant/vortex-ui';

export const ChatLayoutContext = createContext<ChatLayout>('slack');

export function useChatLayout(): ChatLayout {
  return useContext(ChatLayoutContext);
}
