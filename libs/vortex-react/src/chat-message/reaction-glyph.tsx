// libs/vortex-react/src/chat-message/reaction-glyph.tsx
// Composed for vortex-ui; renders a reaction key as an icon (thumbs) or its emoji glyph.
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { THUMBS_UP_KEY, THUMBS_DOWN_KEY } from '@cloudvoyant/vortex-ui';
import type { ReactNode } from 'react';

export function reactionGlyph(key: string): ReactNode {
  if (key === THUMBS_UP_KEY) return <ThumbsUp className="size-3.5" aria-hidden="true" />;
  if (key === THUMBS_DOWN_KEY) return <ThumbsDown className="size-3.5" aria-hidden="true" />;
  return <span aria-hidden="true">{key}</span>;
}

export function reactionLabel(key: string): string {
  if (key === THUMBS_UP_KEY) return 'Thumbs up';
  if (key === THUMBS_DOWN_KEY) return 'Thumbs down';
  return key;
}
