<!-- libs/vortex-svelte/src/agent-chat/AgentStreamingMessage.svelte -->
<!-- Composed for vortex-ui; renders the live streaming record as an agent message.
     Mirrored from @cloudvoyant/vortex-react AgentStreamingMessage. -->
<script lang="ts">
  import { chatStreamingCursorBase, cn } from '@cloudvoyant/vortex-ui';
  import type { AgentStreamingState } from '@cloudvoyant/vortex-ui';
  import ChatMessage from '../chat-message/ChatMessage.svelte';
  import ChatMarkdown from './ChatMarkdown.svelte';

  type Props = {
    streaming: AgentStreamingState;
    from?: string;
    class?: string;
  };

  let { streaming, from = 'Agent', class: className = '' }: Props = $props();

  const hidden = $derived(streaming.status === 'Completed' || streaming.status === 'Cancelled');
  const showCursor = $derived(streaming.status === 'Streaming' || streaming.status === 'Waiting');
</script>

{#if !hidden}
  <ChatMessage variant="agent" {from} class={className} data-streaming-status={streaming.status}>
    {#if streaming.content}
      <ChatMarkdown source={streaming.content} />
    {:else}
      <span class="text-muted-foreground">
        {streaming.status === 'Retrying' ? 'Retrying…' : 'Thinking…'}
      </span>
    {/if}
    {#if showCursor && streaming.content}
      <span class={cn(chatStreamingCursorBase)} aria-hidden="true"></span>
    {/if}
  </ChatMessage>
{/if}
