<!-- libs/vortex-svelte/src/editor/NoticeNodeView.svelte -->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import type { NoticeVariants } from '@cloudvoyant/vortex-ui';
  import { NodeViewContent, NodeViewWrapper } from 'svelte-tiptap';
  import Notice from '../Notice.svelte';

  type NoticeType = Exclude<NoticeVariants['variant'], null | undefined | 'none'>;

  let { node, updateAttributes }: NodeViewProps = $props();
  const variant = $derived((node.attrs.variant as NoticeType | undefined) ?? 'info');
  const title = $derived((node.attrs.title as string | undefined) ?? 'Note');
  const variants: NoticeType[] = ['info', 'success', 'warning', 'error'];
</script>

<NodeViewWrapper class="my-4">
  <Notice {variant} {title} class="relative">
    <div class="absolute end-2 top-2" contenteditable={false}>
      <select
        aria-label="Notice type"
        value={variant}
        onchange={(event) => updateAttributes({ variant: event.currentTarget.value })}
        class="rounded border border-input bg-background px-2 py-1 text-xs"
      >
        {#each variants as value}
          <option {value}>{value}</option>
        {/each}
      </select>
    </div>
    <NodeViewContent class="[&_p]:m-0" />
  </Notice>
</NodeViewWrapper>
