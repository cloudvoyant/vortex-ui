<!-- libs/vortex-svelte/src/editor/MermaidNodeView.svelte -->
<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper } from 'svelte-tiptap';
  import Mermaid from '../Mermaid.svelte';

  let { node, updateAttributes }: NodeViewProps = $props();
  const code = $derived((node.attrs.code as string | undefined) ?? '');
</script>

<NodeViewWrapper class="not-prose my-4 overflow-hidden rounded-lg border border-border" contenteditable={false}>
  <div class="border-b bg-muted/50 px-4 py-2 font-mono text-xs text-muted-foreground">Mermaid</div>
  <textarea
    value={code}
    oninput={(event) => updateAttributes({ code: event.currentTarget.value })}
    aria-label="Mermaid source"
    spellcheck={false}
    class="min-h-28 w-full resize-y border-0 bg-background p-4 font-mono text-sm outline-none"
  ></textarea>
  <div class="border-t p-4">
    <Mermaid {code} />
  </div>
</NodeViewWrapper>
