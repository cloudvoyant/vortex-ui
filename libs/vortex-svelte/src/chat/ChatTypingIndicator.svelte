<!-- libs/vortex-svelte/src/chat/ChatTypingIndicator.svelte -->
<!-- Composed for vortex-ui; mirrored from @cloudvoyant/vortex-react ChatTypingIndicator -->
<script lang="ts">
  import { chatTypingIndicatorBase, chatTypingDotBase, cn } from '@cloudvoyant/vortex-ui';

  type Props = {
    class?: string;
    label?: string;
  };

  let { class: className = '', label = 'Someone is typing' }: Props = $props();
</script>

<div class={cn(chatTypingIndicatorBase, className)} role="status" aria-label={label} data-typing>
  <span class={chatTypingDotBase} style="animation-delay: 0ms" aria-hidden="true"></span>
  <span class={chatTypingDotBase} style="animation-delay: 150ms" aria-hidden="true"></span>
  <span class={chatTypingDotBase} style="animation-delay: 300ms" aria-hidden="true"></span>
</div>
