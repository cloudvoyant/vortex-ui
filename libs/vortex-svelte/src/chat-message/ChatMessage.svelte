<!-- libs/vortex-svelte/src/chat-message/ChatMessage.svelte -->
<!-- Composed for vortex-ui on @ark-ui/svelte/factory; mirrored from @cloudvoyant/vortex-react ChatMessage -->
<script lang="ts">
  import { Ark } from '@ark-ui/svelte/factory';
  import { PaperclipIcon } from 'phosphor-svelte';
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
  import type {
    ChatMessageVariant,
    ChatMessageState,
    ChatReactions,
    ChatMessageAttachment,
  } from '@cloudvoyant/vortex-ui';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getChatLayout } from './ChatContext.svelte';
  import ChatMessageReactions from './ChatMessageReactions.svelte';

  type Props = {
    variant?: ChatMessageVariant;
    from?: string;
    at?: Date;
    state?: ChatMessageState;
    reactions?: ChatReactions;
    attachments?: ChatMessageAttachment[];
    class?: string;
    children?: Snippet;
  } & Omit<HTMLAttributes<HTMLDivElement>, 'from'>;

  let {
    variant = 'default',
    from,
    at,
    state = 'sent',
    reactions,
    attachments,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  const layout = getChatLayout();
  const showMeta = $derived(layout !== 'minimal' && Boolean(from || at));

  function formatTime(value?: Date): string {
    if (!value) return '';
    return value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  const rowClasses = $derived(cn(chatMessageRowVariants({ layout, variant }), className));
  const contentClasses = $derived(chatMessageContentVariants({ layout, variant }));
  const bubbleClasses = $derived(chatMessageBubbleVariants({ layout, variant, state }));
</script>

<Ark as="div" class={rowClasses} data-from={variant} data-state={state} {...rest}>
  <div class={contentClasses}>
    {#if showMeta}
      <div class={chatMessageMetaBase}>
        {#if from}<span class={chatMessageAuthorBase}>{from}</span>{/if}
        {#if at}<time class={chatMessageTimeBase}>{formatTime(at)}</time>{/if}
      </div>
    {/if}
    <div class={bubbleClasses} data-bubble>
      {@render children?.()}
    </div>
    {#if attachments && attachments.length > 0}
      <div class={chatMessageAttachmentsBase}>
        {#each attachments as a (a.id)}
          <div class={chatMessageAttachmentBase} data-attachment>
            <PaperclipIcon class="size-3.5" aria-hidden="true" />
            <span>{a.name}</span>
          </div>
        {/each}
      </div>
    {/if}
    {#if reactions}
      <ChatMessageReactions {reactions} />
    {/if}
  </div>
</Ark>
