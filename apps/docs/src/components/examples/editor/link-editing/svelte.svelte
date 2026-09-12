<!-- apps/docs/src/components/examples/editor/link-editing/svelte.svelte -->
<!-- Chat-style input (no Prose) demonstrating paste-a-URL and inline link editing. -->
<script lang="ts">
  import { Editor } from '@cloudvoyant/vortex-svelte';

  const seed = JSON.stringify({
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Links' }] },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Paste a URL (e.g. https://tiptap.dev) to turn it into a link, pill, or bookmark; select a link to edit its URL and text.',
          },
        ],
      },
    ],
  });
</script>

<div class="rounded-lg border border-input p-3">
  <Editor content={seed} />
</div>
