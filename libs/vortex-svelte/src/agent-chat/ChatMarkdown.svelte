<!-- libs/vortex-svelte/src/agent-chat/ChatMarkdown.svelte -->
<!-- Composed for vortex-ui; renders agent markdown to sanitized HTML. renderChatMarkdown
     is async (marked + dompurify load lazily), so this component holds the parsed HTML in
     state and shows a plain-text fallback until it resolves. Mirrors the React
     useChatMarkdown hook. -->
<script lang="ts">
  import { renderChatMarkdown, chatMarkdownProseBase, cn } from '@cloudvoyant/vortex-ui';

  type Props = {
    source: string;
    class?: string;
  };

  let { source, class: className = '' }: Props = $props();

  let html = $state<string | null>(null);

  $effect(() => {
    const src = source;
    let alive = true;
    html = null;
    renderChatMarkdown(src)
      .then((h) => {
        if (alive) html = h;
      })
      .catch(() => {
        if (alive) html = null;
      });
    return () => {
      alive = false;
    };
  });
</script>

{#if html === null}
  <span class="whitespace-pre-wrap">{source}</span>
{:else}
  <div class={cn(chatMarkdownProseBase, className)} data-chat-markdown>{@html html}</div>
{/if}
