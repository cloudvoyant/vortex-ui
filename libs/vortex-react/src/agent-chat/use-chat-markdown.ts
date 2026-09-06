// libs/vortex-react/src/agent-chat/use-chat-markdown.ts
// Composed for vortex-ui; renders agent-message markdown to sanitized HTML.
// renderChatMarkdown is async (marked + dompurify load lazily), so a hook holds
// the resulting HTML per source. Null means "not parsed yet" — callers render a
// plain-text fallback until it resolves.
import { useEffect, useState } from 'react';
import { renderChatMarkdown } from '@cloudvoyant/vortex-ui';

export function useChatMarkdown(source: string): string | null {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setHtml(null);
    renderChatMarkdown(source)
      .then((h) => {
        if (alive) setHtml(h);
      })
      .catch(() => {
        if (alive) setHtml(null);
      });
    return () => {
      alive = false;
    };
  }, [source]);

  return html;
}
