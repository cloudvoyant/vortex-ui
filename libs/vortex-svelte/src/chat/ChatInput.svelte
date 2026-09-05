<!-- libs/vortex-svelte/src/chat/ChatInput.svelte -->
<!-- Composed for vortex-ui on @cloudvoyant/vortex-svelte Textarea + Button; mirrored from @cloudvoyant/vortex-react ChatInput -->
<script lang="ts">
  import { PaperclipIcon, PaperPlaneRightIcon as SendIcon, XIcon } from 'phosphor-svelte';
  import Textarea from '../Textarea.svelte';
  import Button from '../Button.svelte';
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

  type Props = {
    class?: string;
    placeholder?: string;
    disabled?: boolean;
    allowAttachments?: boolean;
    onSend?: (submit: ChatInputSubmit) => void;
  };

  let {
    class: className = '',
    placeholder = 'Type a message…',
    disabled = false,
    allowAttachments = true,
    onSend,
  }: Props = $props();

  let draft = $state('');
  let attachments = $state<ChatMessageAttachment[]>([]);
  let fileInput = $state<HTMLInputElement>();
  let seq = 0;

  const canSend = $derived(draft.trim().length > 0 || attachments.length > 0);

  function send() {
    const text = draft.trim();
    if (!text && attachments.length === 0) return;
    onSend?.({ text, attachments });
    draft = '';
    attachments = [];
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function handleFiles(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    attachments = [...attachments, ...files.map((f) => ({ id: `att-${++seq}`, name: f.name, size: f.size }))];
    input.value = '';
  }

  function removeAttachment(id: string) {
    attachments = attachments.filter((a) => a.id !== id);
  }
</script>

<div class={cn(chatInputRootBase, className)} data-chat-input>
  {#if attachments.length > 0}
    <div class={chatInputAttachmentsBase}>
      {#each attachments as a (a.id)}
        <span class={chatInputAttachmentChipBase} data-attachment>
          <PaperclipIcon class="size-3" aria-hidden="true" />
          {a.name}
          <button
            type="button"
            class={chatInputAttachmentRemoveBase}
            aria-label={`Remove ${a.name}`}
            onclick={() => removeAttachment(a.id)}
          >
            <XIcon class="size-3" aria-hidden="true" />
          </button>
        </span>
      {/each}
    </div>
  {/if}
  <div class={chatInputRowBase}>
    {#if allowAttachments}
      <button
        type="button"
        class={chatInputAttachTriggerBase}
        aria-label="Attach file"
        {disabled}
        onclick={() => fileInput?.click()}
      >
        <PaperclipIcon class="size-4" aria-hidden="true" />
      </button>
      <input bind:this={fileInput} type="file" multiple hidden onchange={handleFiles} data-file-input />
    {/if}
    <Textarea
      class={chatInputTextareaBase}
      {placeholder}
      value={draft}
      oninput={(e) => (draft = (e.currentTarget as HTMLTextAreaElement).value)}
      {disabled}
      rows={1}
      onkeydown={handleKeyDown}
      data-draft
    />
    <Button type="button" size="icon" aria-label="Send message" disabled={disabled || !canSend} onclick={send}>
      <SendIcon class="size-4" aria-hidden="true" />
    </Button>
  </div>
</div>
