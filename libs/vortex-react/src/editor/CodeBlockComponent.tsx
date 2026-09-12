// libs/vortex-react/src/editor/CodeBlockComponent.tsx
// React parity of CodeBlockComponent.svelte. The source's local `./ui/command` palette is
// replaced by vortex Popover + the Listbox parts (a command palette is what Listbox is).
import { useMemo, useState } from 'react';
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import { ChevronsUpDown, Check } from 'lucide-react';
import {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockTitle,
  CodeBlockCopyButton,
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
import {
  cn,
  codeBlockBodyBase,
  codeBlockContentBase,
  defaultListboxFilter,
  type ListboxItemData,
} from '@cloudvoyant/vortex-ui';

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
    <NodeViewWrapper className="my-4">
      <CodeBlock code={node.textContent} language={language} className="my-0">
        <CodeBlockHeader>
          <CodeBlockTitle>{currentLabel}</CodeBlockTitle>
          <div className="ml-auto flex items-center gap-2" contentEditable={false}>
            {editable ? (
              <Popover
                open={open}
                onOpenChange={(details) => {
                  setOpen(details.open);
                  if (!details.open) setQuery('');
                }}
              >
                <PopoverTrigger className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm hover:bg-accent">
                  Change language
                  <ChevronsUpDown className="h-3 w-3 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
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
            ) : null}
            <CodeBlockCopyButton />
          </div>
        </CodeBlockHeader>
        <div className={codeBlockBodyBase}>
          <pre className={cn(codeBlockContentBase, 'm-0 p-4 font-mono [&_code]:bg-transparent [&_code]:p-0')}>
            {/* NodeViewContent is generic with NoInfer<T>, so the element type must be explicit. */}
            <NodeViewContent<'code'> as="code" />
          </pre>
        </div>
      </CodeBlock>
    </NodeViewWrapper>
  );
}
