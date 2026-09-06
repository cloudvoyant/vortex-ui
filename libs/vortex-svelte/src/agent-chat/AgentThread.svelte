<!-- libs/vortex-svelte/src/agent-chat/AgentThread.svelte -->
<!-- Composed for vortex-ui; virtualized agentic thread. Agent messages render sanitized
     markdown (via ChatMarkdown); user/default render plain text. Uses
     @tanstack/svelte-virtual — long threads only mount visible rows. -->
<script lang="ts">
  import { createVirtualizer } from '@tanstack/svelte-virtual';
  import { get } from 'svelte/store';
  import { chatThreadBase, cn } from '@cloudvoyant/vortex-ui';
  import type { AgenticMessage } from '@cloudvoyant/vortex-ui';
  import ChatMessage from '../chat-message/ChatMessage.svelte';
  import ChatMarkdown from './ChatMarkdown.svelte';

  type Props = {
    messages: AgenticMessage[];
    onScrollTop?: () => void;
    class?: string;
    estimateSize?: number;
  };

  let { messages, onScrollTop, class: className = '', estimateSize = 72 }: Props = $props();

  let parentRef = $state<HTMLDivElement>();

  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: messages.length,
    getScrollElement: () => parentRef ?? null,
    estimateSize: () => estimateSize,
    overscan: 6,
  });

  // Keep the virtualizer options in sync with the props (message count can grow).
  $effect(() => {
    get(virtualizer)?.setOptions({
      count: messages.length,
      getScrollElement: () => parentRef ?? null,
      estimateSize: () => estimateSize,
      overscan: 6,
    });
    get(virtualizer)?.measure();
  });

  // Measure each mounted row's real height (variable markdown content). The row
  // carries data-index, which the virtualizer's measureElement reads.
  function measureRow(node: HTMLDivElement) {
    const measure = get(virtualizer)?.measureElement;
    measure?.(node);
    return {
      update(node2: HTMLDivElement) {
        measure?.(node2);
      },
    };
  }

  function handleScroll() {
    if (parentRef && parentRef.scrollTop <= 0) onScrollTop?.();
  }
</script>

<div
  bind:this={parentRef}
  onscroll={handleScroll}
  class={cn(chatThreadBase, 'relative overflow-y-auto', className)}
  data-agent-thread
>
  <div style="height: {$virtualizer.getTotalSize()}px; width: 100%; position: relative;">
    {#each $virtualizer.getVirtualItems() as item (messages[item.index]?.id ?? item.index)}
      {@const message = messages[item.index]}
      {#if message}
        <div
          data-index={item.index}
          use:measureRow
          style="position: absolute; top: 0; left: 0; width: 100%; transform: translateY({item.start}px);"
        >
          <ChatMessage variant={message.variant} from={message.from} at={message.at}>
            {#if message.variant === 'agent'}
              <ChatMarkdown source={message.content} />
            {:else}
              {message.content}
            {/if}
          </ChatMessage>
        </div>
      {/if}
    {/each}
  </div>
</div>
