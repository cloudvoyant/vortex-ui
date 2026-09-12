// libs/vortex-react/src/editor/MermaidNodeView.tsx
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { Mermaid } from '../mermaid';

export function MermaidNodeView({ node, updateAttributes }: NodeViewProps) {
  const code = (node.attrs.code as string | undefined) ?? '';

  return (
    <NodeViewWrapper className="not-prose my-4 overflow-hidden rounded-lg border border-border" contentEditable={false}>
      <div className="border-b bg-muted/50 px-4 py-2 font-mono text-xs text-muted-foreground">Mermaid</div>
      <textarea
        value={code}
        onChange={(event) => updateAttributes({ code: event.target.value })}
        aria-label="Mermaid source"
        spellCheck={false}
        className="min-h-28 w-full resize-y border-0 bg-background p-4 font-mono text-sm outline-none"
      />
      <div className="border-t p-4">
        <Mermaid code={code} />
      </div>
    </NodeViewWrapper>
  );
}
