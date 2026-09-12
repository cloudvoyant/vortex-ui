// libs/vortex-react/src/editor/ImageNodeView.tsx
// React parity of ImageNodeView.svelte. Must render the exact classes the vortex-ui ProseMirror
// plugins target: figure[data-type="image-node"], .caption-input, and it must tolerate the
// .image-node-pending-delete decoration added by the two-step backspace plugin.
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

export function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const { src, srcset, alt, caption } = node.attrs as {
    src: string;
    srcset?: string;
    alt?: string;
    caption?: string;
  };

  return (
    <NodeViewWrapper as="figure" data-type="image-node" className="my-6 m-0 relative">
      <img
        src={src}
        srcSet={srcset || undefined}
        alt={alt || ''}
        sizes="(max-width: 768px) 100vw, 720px"
        className="w-full object-cover"
        data-selected={selected ? '' : undefined}
      />
      <input
        className="caption-input mt-4 w-full bg-transparent text-center text-sm italic text-muted-foreground outline-none"
        placeholder="Add a caption…"
        value={caption || ''}
        onChange={(event) => updateAttributes({ caption: event.target.value })}
      />
    </NodeViewWrapper>
  );
}
