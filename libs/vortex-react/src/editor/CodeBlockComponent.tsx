// libs/vortex-react/src/editor/CodeBlockComponent.tsx
// React parity of CodeBlockComponent.svelte. The source's local `./ui/command` palette is
// replaced by vortex Popover + the Listbox parts (a command palette is what Listbox is).
import { useMemo, useState } from 'react';
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import { ChevronsUpDown, Check } from 'lucide-react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  Listbox,
  ListboxContent,
  ListboxInput,
  ListboxItem,
  ListboxItemText,
  ListboxItemIndicator,
} from '..';
import { cn, defaultListboxFilter, type ListboxItemData } from '@cloudvoyant/vortex-ui';

const LANGUAGES: ListboxItemData[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'sql', label: 'SQL' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'plaintext', label: 'Plain Text' },
];

export function CodeBlockComponent({ node, editor, updateAttributes }: NodeViewProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const language = (node.attrs.language as string) || 'javascript';
  const editable = editor.isEditable;

  const filtered = useMemo(() => LANGUAGES.filter((item) => defaultListboxFilter(item, query)), [query]);
  const currentLabel = LANGUAGES.find((item) => item.value === language)?.label ?? 'JavaScript';

  return (
    <NodeViewWrapper className="code-block-wrapper relative my-4">
      {editable ? (
        <div className="language-selector">
          <Popover
            open={open}
            onOpenChange={(details) => {
              setOpen(details.open);
              if (!details.open) setQuery('');
            }}
          >
            <PopoverTrigger className="inline-flex items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-sm hover:bg-accent">
              {currentLabel}
              <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="language-popover w-[200px] p-0">
              <Listbox
                items={filtered}
                value={[language]}
                onValueChange={(details) => {
                  const next = details.value[0];
                  if (next) {
                    updateAttributes({ language: next });
                    setOpen(false);
                  }
                }}
              >
                <ListboxInput
                  placeholder="Search language…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoHighlight
                />
                <ListboxContent>
                  {filtered.map((item) => (
                    <ListboxItem key={item.value} item={item}>
                      <ListboxItemText>{item.label}</ListboxItemText>
                      <ListboxItemIndicator className={cn(language !== item.value && 'text-transparent')}>
                        <Check className="mr-2 h-4 w-4" />
                      </ListboxItemIndicator>
                    </ListboxItem>
                  ))}
                </ListboxContent>
              </Listbox>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <span className="code-block-language-label">{currentLabel}</span>
      )}
      <pre className="code-block-content">
        {/* NodeViewContent is generic with NoInfer<T>, so the element type must be explicit. */}
        <NodeViewContent<'code'> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
