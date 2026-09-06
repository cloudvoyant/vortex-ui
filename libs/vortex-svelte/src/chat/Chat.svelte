<!-- libs/vortex-svelte/src/chat/Chat.svelte -->
<!-- Composed for vortex-ui on @ark-ui/svelte/factory; mirrored from @cloudvoyant/vortex-react Chat -->
<script lang="ts">
  import { Ark } from '@ark-ui/svelte/factory';
  import { chatRootBase, cn } from '@cloudvoyant/vortex-ui';
  import type { ChatLayout } from '@cloudvoyant/vortex-ui';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { setChatLayout } from '../chat-message/ChatContext.svelte';

  type Props = {
    layout?: ChatLayout;
    class?: string;
    children?: Snippet;
  } & HTMLAttributes<HTMLDivElement>;

  let { layout = 'slack', class: className = '', children, ...rest }: Props = $props();

  setChatLayout(layout);

  const classes = $derived(cn(chatRootBase, className));
</script>

<Ark as="div" class={classes} data-layout={layout} {...rest}>
  {@render children?.()}
</Ark>
