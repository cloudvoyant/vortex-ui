// libs/vortex-react/src/agent-chat/AgentChat.tsx
// Composed for vortex-ui on @ark-ui/react/factory; no upstream chat primitive.
import { ark, type HTMLArkProps } from '@ark-ui/react/factory';
import { chatRootBase, cn, type ChatLayout } from '@cloudvoyant/vortex-ui';
import { ChatLayoutContext } from '../chat-message/ChatContext';

export type AgentChatProps = HTMLArkProps<'div'> & { layout?: ChatLayout };

export function AgentChat({ className, layout = 'minimal', children, ...props }: AgentChatProps) {
  return (
    <ChatLayoutContext.Provider value={layout}>
      <ark.div className={cn(chatRootBase, className)} data-layout={layout} {...props}>
        {children}
      </ark.div>
    </ChatLayoutContext.Provider>
  );
}
