<!-- libs/vortex-svelte/src/chat/ChatThread.svelte -->
<!-- Composed for vortex-ui on @cloudvoyant/vortex-svelte Scroll; mirrored from @cloudvoyant/vortex-react ChatThread -->
<script lang="ts">
  import Scroll from '../Scroll.svelte';
  import { chatThreadBase, chatThreadContentBase, cn } from '@cloudvoyant/vortex-ui';
  import type { Snippet } from 'svelte';

  type Props = {
    class?: string;
    contentClass?: string;
    onScrollTop?: () => void;
    children?: Snippet;
  };

  let { class: className = '', contentClass = '', onScrollTop, children }: Props = $props();

  let fired = false;

  function handleScroll(e: Event) {
    const el = e.currentTarget as HTMLElement;
    if (el.scrollTop <= 8) {
      if (!fired) {
        fired = true;
        onScrollTop?.();
      }
    } else {
      fired = false;
    }
  }
</script>

<Scroll
  class={cn(chatThreadBase, className)}
  viewportClass="flex h-full w-full flex-col"
  onscroll={onScrollTop ? handleScroll : undefined}
>
  <div class={cn(chatThreadContentBase, contentClass)} data-thread-content>
    {@render children?.()}
  </div>
</Scroll>
