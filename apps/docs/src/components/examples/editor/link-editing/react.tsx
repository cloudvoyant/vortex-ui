// apps/docs/src/components/examples/editor/link-editing/react.tsx
// Chat-style input (no Prose) demonstrating paste-a-URL and inline link editing.
import { Editor } from '@cloudvoyant/vortex-react';

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

export default function ReactEditorLinkEditing() {
  return (
    <div className="rounded-lg border border-input p-3">
      <Editor content={seed} />
    </div>
  );
}
