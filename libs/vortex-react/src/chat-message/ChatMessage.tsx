// libs/vortex-react/src/chat-message/ChatMessage.tsx
// Composed for vortex-ui on @ark-ui/react/factory; no upstream chat primitive.
import { ark, type HTMLArkProps } from '@ark-ui/react/factory';
import {
  chatMessageRowVariants,
  chatMessageContentVariants,
  chatMessageBubbleVariants,
  chatMessageMetaBase,
  chatMessageAuthorBase,
  chatMessageTimeBase,
  chatMessageAttachmentsBase,
  chatMessageAttachmentBase,
  cn,
} from '@cloudvoyant/vortex-ui';
import type { ChatMessageProps as ChatMessageBaseProps, ChatMessageAttachment } from '@cloudvoyant/vortex-ui';
import { PaperclipIcon } from '../chat-icons';
import { useChatLayout } from './ChatContext';
import { ChatMessageReactions } from './ChatMessageReactions';

export type ChatMessageProps = Omit<HTMLArkProps<'div'>, 'from'> & ChatMessageBaseProps;

function formatTime(at?: Date): string {
  if (!at) return '';
  return at.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function ChatMessage({
  className,
  variant = 'default',
  from,
  at,
  state = 'sent',
  reactions,
  attachments,
  children,
  ...props
}: ChatMessageProps) {
  const layout = useChatLayout();
  const showMeta = layout !== 'minimal' && Boolean(from || at);
  return (
    <ark.div
      className={cn(chatMessageRowVariants({ layout, variant }), className)}
      data-from={variant}
      data-state={state}
      {...props}
    >
      <div className={chatMessageContentVariants({ layout, variant })}>
        {showMeta ? (
          <div className={chatMessageMetaBase}>
            {from ? <span className={chatMessageAuthorBase}>{from}</span> : null}
            {at ? <time className={chatMessageTimeBase}>{formatTime(at)}</time> : null}
          </div>
        ) : null}
        <div className={chatMessageBubbleVariants({ layout, variant, state })} data-bubble>
          {children}
        </div>
        {attachments && attachments.length > 0 ? (
          <div className={chatMessageAttachmentsBase}>
            {attachments.map((a: ChatMessageAttachment) => (
              <div key={a.id} className={chatMessageAttachmentBase} data-attachment>
                <PaperclipIcon className="size-3.5" aria-hidden="true" />
                <span>{a.name}</span>
              </div>
            ))}
          </div>
        ) : null}
        {reactions ? <ChatMessageReactions reactions={reactions} /> : null}
      </div>
    </ark.div>
  );
}
