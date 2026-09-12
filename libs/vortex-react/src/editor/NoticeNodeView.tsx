// libs/vortex-react/src/editor/NoticeNodeView.tsx
import { NodeViewContent, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import type { NoticeVariants } from '@cloudvoyant/vortex-ui';
import { Notice } from '../notice';

type NoticeType = Exclude<NoticeVariants['variant'], null | undefined | 'none'>;

const VARIANTS: NoticeType[] = ['info', 'success', 'warning', 'error'];

export function NoticeNodeView({ node, updateAttributes }: NodeViewProps) {
  const variant = (node.attrs.variant as NoticeType | undefined) ?? 'info';
  const title = (node.attrs.title as string | undefined) ?? 'Note';

  return (
    <NodeViewWrapper className="my-4">
      <Notice variant={variant} title={title} className="relative">
        <div className="absolute end-2 top-2" contentEditable={false}>
          <select
            aria-label="Notice type"
            value={variant}
            onChange={(event) => updateAttributes({ variant: event.target.value })}
            className="rounded border border-input bg-background px-2 py-1 text-xs"
          >
            {VARIANTS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <NodeViewContent className="[&_p]:m-0" />
      </Notice>
    </NodeViewWrapper>
  );
}
