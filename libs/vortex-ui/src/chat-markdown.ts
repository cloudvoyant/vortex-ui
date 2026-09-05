// libs/vortex-ui/src/chat-markdown.ts
// Composed for vortex-ui; sanitized markdown → HTML for agent messages. Uses
// marked (parse) + dompurify (sanitize), both optional peers loaded lazily via
// dynamic import — never bundled, only fetched when an agent message renders
// (mirrors the repo's mermaid/shiki pattern). dompurify needs a DOM, so this
// runs client-side; agent-message demos hydrate with client:load.
export const chatMarkdownProseBase =
  'prose prose-sm max-w-none dark:prose-invert prose-pre:bg-muted prose-pre:text-foreground prose-code:text-foreground';

let markedModule: Promise<typeof import('marked')> | null = null;
let purifyModule: Promise<typeof import('dompurify')> | null = null;

export async function renderChatMarkdown(md: string): Promise<string> {
  const [markedMod, purifyMod] = await Promise.all([
    (markedModule ??= import('marked')),
    (purifyModule ??= import('dompurify')),
  ]);
  const raw = markedMod.marked.parse(md, { async: false, gfm: true, breaks: true }) as string;
  return purifyMod.default.sanitize(raw, { USE_PROFILES: { html: true } });
}
