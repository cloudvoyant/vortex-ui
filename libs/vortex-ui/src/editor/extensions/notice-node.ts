// libs/vortex-ui/src/editor/extensions/notice-node.ts
// Editable Notice block. Framework node views render the existing vortex Notice component;
// renderHTML keeps the same content available to the static Reader.
import { Node, mergeAttributes } from '@tiptap/core';
import type { NodeViewFactory } from '../types';

export type NoticeVariant = 'info' | 'success' | 'warning' | 'error';

export interface NoticeAttributes {
  variant?: NoticeVariant;
  title?: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    notice: {
      insertNotice: (attributes?: NoticeAttributes) => ReturnType;
    };
  }
}

export const createNoticeNode = (nodeView?: NodeViewFactory) =>
  Node.create({
    name: 'notice',
    group: 'block',
    content: 'block+',
    defining: true,

    addAttributes() {
      return {
        variant: { default: 'info' },
        title: { default: 'Note' },
      };
    },

    parseHTML() {
      return [{ tag: 'aside[data-type="notice"]' }];
    },

    renderHTML({ HTMLAttributes }) {
      const variant = (HTMLAttributes.variant as NoticeVariant | undefined) ?? 'info';
      return [
        'aside',
        mergeAttributes(HTMLAttributes, {
          'data-type': 'notice',
          'data-variant': variant,
          class: 'editor-notice my-4 rounded-lg border border-border bg-muted/40 p-4',
        }),
        0,
      ];
    },

    addNodeView() {
      return nodeView ? nodeView() : null;
    },

    addCommands() {
      return {
        insertNotice:
          (attributes = {}) =>
          ({ commands }) =>
            commands.insertContent({
              type: this.name,
              attrs: attributes,
              content: [{ type: 'paragraph', content: [] }],
            }),
      };
    },
  });
