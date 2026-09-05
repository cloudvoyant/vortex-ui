<!-- libs/vortex-svelte/src/chat-message/ChatMessageReactions.svelte -->
<!-- Composed for vortex-ui; mirrored from @cloudvoyant/vortex-react ChatMessageReactions -->
<script lang="ts">
  import { ThumbsUpIcon, ThumbsDownIcon } from 'phosphor-svelte';
  import {
    chatReactionListBase,
    chatReactionChipBase,
    THUMBS_UP_KEY,
    THUMBS_DOWN_KEY,
    cn,
  } from '@cloudvoyant/vortex-ui';
  import type { ChatReactions } from '@cloudvoyant/vortex-ui';

  type Props = {
    reactions: ChatReactions;
    onReact?: (key: string) => void;
    class?: string;
  };

  let { reactions, onReact, class: className = '' }: Props = $props();

  const entries = $derived(Object.entries(reactions).filter(([, count]) => count > 0));

  function label(key: string): string {
    if (key === THUMBS_UP_KEY) return 'Thumbs up';
    if (key === THUMBS_DOWN_KEY) return 'Thumbs down';
    return key;
  }
</script>

{#if entries.length > 0}
  <div class={cn(chatReactionListBase, className)} role="group" aria-label="Reactions">
    {#each entries as [key, count] (key)}
      <button
        type="button"
        class={chatReactionChipBase}
        data-reaction={key}
        aria-label={`${label(key)}: ${count}`}
        onclick={() => onReact?.(key)}
      >
        {#if key === THUMBS_UP_KEY}
          <ThumbsUpIcon class="size-3.5" aria-hidden="true" />
        {:else if key === THUMBS_DOWN_KEY}
          <ThumbsDownIcon class="size-3.5" aria-hidden="true" />
        {:else}
          <span aria-hidden="true">{key}</span>
        {/if}
        <span>{count}</span>
      </button>
    {/each}
  </div>
{/if}
