<!-- apps/docs/src/components/examples/editor/slash-menu/svelte.svelte -->
<script lang="ts">
  import { Editor, Prose } from '@cloudvoyant/vortex-svelte';

  const seed = JSON.stringify({
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Blocks' }] },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: "Scroll to the last line, then type '/' to test the anchored block palette." }],
      },
      ...Array.from({ length: 15 }, () => ({ type: 'paragraph', content: [] })),
      { type: 'paragraph', content: [{ type: 'text', text: 'Type on the empty line below.' }] },
      { type: 'paragraph', content: [] },
    ],
  });
</script>

<Prose>
  <Editor content={seed} />
</Prose>
