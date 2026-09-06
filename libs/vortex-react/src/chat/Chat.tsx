// libs/vortex-react/src/chat/Chat.tsx
// Composed for vortex-ui on @ark-ui/react/factory; no upstream chat primitive.
import { ark, type HTMLArkProps } from '@ark-ui/react/factory';
import { chatRootBase, cn } from '@cloudvoyant/vortex-ui';
import type { ChatProps as ChatBaseProps } from '@cloudvoyant/vortex-ui';
import { ChatLayoutContext } from '../chat-message/ChatContext';

export type ChatProps = HTMLArkProps<'div'> & ChatBaseProps;

export function Chat({ className, layout = 'slack', children, ...props }: ChatProps) {
  return (
    <ChatLayoutContext.Provider value={layout}>
      <ark.div className={cn(chatRootBase, className)} data-layout={layout} {...props}>
        {children}
      </ark.div>
    </ChatLayoutContext.Provider>
  );
}
