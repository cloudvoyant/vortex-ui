// libs/vortex-react/src/chat/ChatInput.tsx
// Composed for vortex-ui on @cloudvoyant/vortex-react Textarea + Button; no upstream chat primitive.
import { useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import { Textarea } from '../textarea';
import { Button } from '../button';
import {
  chatInputRootBase,
  chatInputRowBase,
  chatInputTextareaBase,
  chatInputAttachmentsBase,
  chatInputAttachmentChipBase,
  chatInputAttachmentRemoveBase,
  chatInputAttachTriggerBase,
  cn,
} from '@cloudvoyant/vortex-ui';
import type { ChatMessageAttachment, ChatInputSubmit } from '@cloudvoyant/vortex-ui';

export interface ChatInputProps {
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  allowAttachments?: boolean;
  onSend?: (submit: ChatInputSubmit) => void;
}

let attachmentSeq = 0;

export function ChatInput({
  className,
  placeholder = 'Type a message…',
  disabled = false,
  allowAttachments = true,
  onSend,
}: ChatInputProps) {
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<ChatMessageAttachment[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const send = () => {
    const text = draft.trim();
    if (!text && attachments.length === 0) return;
    onSend?.({ text, attachments });
    setDraft('');
    setAttachments([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setAttachments((prev) => [
      ...prev,
      ...files.map((f) => ({ id: `att-${++attachmentSeq}`, name: f.name, size: f.size })),
    ]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => setAttachments((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className={cn(chatInputRootBase, className)} data-chat-input>
      {attachments.length > 0 ? (
        <div className={chatInputAttachmentsBase}>
          {attachments.map((a) => (
            <span key={a.id} className={chatInputAttachmentChipBase} data-attachment>
              <Paperclip className="size-3" aria-hidden="true" />
              {a.name}
              <button
                type="button"
                className={chatInputAttachmentRemoveBase}
                aria-label={`Remove ${a.name}`}
                onClick={() => removeAttachment(a.id)}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <div className={chatInputRowBase}>
        {allowAttachments ? (
          <>
            <button
              type="button"
              className={chatInputAttachTriggerBase}
              aria-label="Attach file"
              disabled={disabled}
              onClick={() => fileRef.current?.click()}
            >
              <Paperclip className="size-4" aria-hidden="true" />
            </button>
            <input ref={fileRef} type="file" multiple hidden onChange={handleFiles} data-file-input />
          </>
        ) : null}
        <Textarea
          className={chatInputTextareaBase}
          placeholder={placeholder}
          value={draft}
          disabled={disabled}
          rows={1}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          data-draft
        />
        <Button
          type="button"
          size="icon"
          aria-label="Send message"
          disabled={disabled || (!draft.trim() && attachments.length === 0)}
          onClick={send}
        >
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
