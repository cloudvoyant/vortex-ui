// libs/vortex-ui/src/editor/extensions/mermaid-node.ts
// A specialized Mermaid block stores diagram source as an attribute and delegates the live
// source editor/preview to each framework's node view. The Reader retains readable source.
import { Node, mergeAttributes } from '@tiptap/core';
import type { NodeViewFactory } from '../types';

export interface MermaidAttributes {
  code?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mermaidDiagram: {
      insertMermaid: (attributes?: MermaidAttributes) => ReturnType;
    };
  }
}

const DEFAULT_MERMAID = 'flowchart TD\n  A[Start] --> B[Finish]';

export const createMermaidNode = (nodeView?: NodeViewFactory) =>
  Node.create({
    name: 'mermaidDiagram',
    group: 'block',
    atom: true,

    addAttributes() {
      return { code: { default: DEFAULT_MERMAID } };
    },

    parseHTML() {
      return [{ tag: 'figure[data-type="mermaid-diagram"]' }];
    },

    renderHTML({ HTMLAttributes }) {
      const code = typeof HTMLAttributes.code === 'string' ? HTMLAttributes.code : DEFAULT_MERMAID;
      return [
        'figure',
        mergeAttributes(HTMLAttributes, {
          'data-type': 'mermaid-diagram',
          class: 'editor-mermaid my-4',
        }),
        [
          'pre',
          { class: 'whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 font-mono text-sm' },
          code,
        ],
      ];
    },

    addNodeView() {
      return nodeView ? nodeView() : null;
    },

    addCommands() {
      return {
        insertMermaid:
          (attributes = {}) =>
          ({ commands }) =>
            commands.insertContent({ type: this.name, attrs: { code: attributes.code ?? DEFAULT_MERMAID } }),
      };
    },
  });
