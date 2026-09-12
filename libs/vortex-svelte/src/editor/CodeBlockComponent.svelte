<script lang="ts">
  import type { NodeViewProps } from '@tiptap/core';
  import { NodeViewWrapper, NodeViewContent } from 'svelte-tiptap';
  import { tick } from 'svelte';
  // Intra-package imports stay relative: importing '@cloudvoyant/vortex-svelte' from inside the
  // package is fragile during the svelte-package build.
  import { Popover, PopoverTrigger, PopoverContent } from '../popover';
  import { CodeBlock, CodeBlockHeader, CodeBlockTitle, CodeBlockCopyButton } from '../code-block';
  import {
    Listbox,
    ListboxInput,
    ListboxContent,
    ListboxItem,
    ListboxItemText,
    ListboxItemIndicator,
  } from '../listbox';
  import { cn, codeBlockBodyBase, codeBlockContentBase, defaultListboxFilter } from '@cloudvoyant/vortex-ui';
  import { ChevronsUpDown, Check } from 'lucide-svelte';

  let { node, editor, updateAttributes }: NodeViewProps = $props();

  const languages = [
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

  let open = $state(false);
  let triggerRef = $state<HTMLButtonElement>(null!);
  let languageQuery = $state('');

  const filteredLanguages = $derived(languages.filter((l) => defaultListboxFilter(l, languageQuery)));

  function getDefaultLanguage(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('codeblock-last-language') || 'javascript';
    }
    return 'javascript';
  }

  const language = $derived(node.attrs.language || getDefaultLanguage());
  const editable = $derived(editor.isEditable);

  const currentLanguageLabel = $derived(languages.find((l) => l.value === language)?.label || 'JavaScript');

  function changeLanguage(newLanguage: string) {
    updateAttributes({ language: newLanguage });
    if (typeof window !== 'undefined') {
      localStorage.setItem('codeblock-last-language', newLanguage);
    }
    closeAndFocusTrigger();
  }

  function closeAndFocusTrigger() {
    open = false;
    languageQuery = '';
    tick().then(() => {
      triggerRef?.focus();
    });
  }

  // Initialize with default language from localStorage
  $effect(() => {
    if (editable && !node.attrs.language) {
      const defaultLang = getDefaultLanguage();
      if (defaultLang !== language) {
        updateAttributes({ language: defaultLang });
      }
    }
  });
</script>

<NodeViewWrapper class="my-4">
  <CodeBlock code={node.textContent} language={language} class="my-0">
    <CodeBlockHeader>
      <CodeBlockTitle>{currentLanguageLabel}</CodeBlockTitle>
      <div class="ml-auto flex items-center gap-2" contenteditable={false}>
        {#if editable}
          <Popover
            {open}
            onOpenChange={(details) => {
              open = details.open;
              if (!details.open) languageQuery = '';
            }}
          >
            <PopoverTrigger
              class="inline-flex items-center gap-1 rounded-md border border-input bg-background px-2 py-1 text-xs shadow-sm hover:bg-accent"
            >
              Change language
              <ChevronsUpDown class="h-3 w-3 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent class="w-[200px] p-0">
              <Listbox
                items={filteredLanguages}
                value={[language]}
                onValueChange={(details) => {
                  const next = details.value[0];
                  if (next) changeLanguage(next);
                }}
              >
                <ListboxInput
                  placeholder="Search language..."
                  value={languageQuery}
                  oninput={(event) => (languageQuery = (event.currentTarget as HTMLInputElement).value)}
                  autoHighlight
                />
                <ListboxContent>
                  {#each filteredLanguages as lang}
                    <ListboxItem item={lang}>
                      <ListboxItemText>{lang.label}</ListboxItemText>
                      <ListboxItemIndicator class={cn(language !== lang.value && 'text-transparent')}>
                        <Check class="mr-2 h-4 w-4" />
                      </ListboxItemIndicator>
                    </ListboxItem>
                  {/each}
                </ListboxContent>
              </Listbox>
            </PopoverContent>
          </Popover>
        {/if}
        <CodeBlockCopyButton />
      </div>
    </CodeBlockHeader>
    <div class={codeBlockBodyBase}>
      <pre class={cn(codeBlockContentBase, 'm-0 p-4 font-mono [&_code]:bg-transparent [&_code]:p-0')}>
        <NodeViewContent as="code" />
      </pre>
    </div>
  </CodeBlock>
</NodeViewWrapper>

<style>
  :global(.code-block-wrapper) {
    position: relative;
    border: none;
    outline: none;
    background-color: var(--code-block-bg);
    min-height: 80px;
  }

  .language-selector {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    z-index: 10;
  }

  .language-selector :global(button) {
    padding: 0.25rem 0.5rem !important;
    border: 1px solid #d0d7de !important;
    gap: 0.25rem !important;
    font-size: 0.75rem !important;
    line-height: 1rem !important;
    height: auto !important;
    border-radius: 0.25rem !important;
  }

  :global(.dark) .language-selector :global(button) {
    border-color: #30363d !important;
  }

  :global(.language-popover),
  :global(.language-popover):focus-within {
    outline: none !important;
    box-shadow: none !important;
  }

  .code-block-language-label {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    background-color: var(--lang-label-bg);
    color: var(--lang-label-text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    z-index: 10;
    border: 1px solid var(--lang-label-border);
  }

  :global(.code-block-content) {
    padding: 2.5rem 1rem 1rem 1rem;
    overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0;
    background: transparent;
    color: #24292f;
    border: none;
    outline: none;
    min-height: 60px;
  }

  :global(.dark .code-block-content) {
    color: #c9d1d9;
  }

  :global(.code-block-content code) {
    background: none !important;
    padding: 0 !important;
    font-size: inherit;
    font-family: inherit;
    color: inherit !important;
    outline: none !important;
  }

  :global(.code-block-content *) {
    background: transparent !important;
  }

  /* Override any lowlight/hljs default styles */
  :global(.code-block-wrapper pre),
  :global(.code-block-wrapper code) {
    background: transparent !important;
    outline: none !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  /* Remove TipTap focus outline and border */
  :global(.code-block-wrapper .ProseMirror),
  :global(.code-block-wrapper .ProseMirror pre),
  :global(.code-block-wrapper .ProseMirror-focused),
  :global(.code-block-wrapper [contenteditable]),
  :global(.code-block-wrapper .ProseMirror:focus),
  :global(.code-block-wrapper .ProseMirror pre:focus),
  :global(.code-block-wrapper [contenteditable]:focus) {
    outline: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Remove any focus-visible styles */
  :global(.code-block-wrapper *:focus-visible),
  :global(.code-block-wrapper .ProseMirror pre:focus-visible),
  :global(.code-block-wrapper .ProseMirror-focused) {
    outline: none !important;
    box-shadow: none !important;
    border: none !important;
  }

  /* Force remove border from ProseMirror */
  :global(.code-block-wrapper) :global(.ProseMirror) {
    border: none !important;
  }

  /* Light mode syntax highlighting */
  :global(.code-block-wrapper .hljs-keyword),
  :global(.code-block-wrapper .hljs-selector-tag),
  :global(.code-block-wrapper .hljs-literal),
  :global(.code-block-wrapper .hljs-built_in) {
    color: #d73a49;
  }

  :global(.code-block-wrapper .hljs-string),
  :global(.code-block-wrapper .hljs-doctag) {
    color: #032f62;
  }

  :global(.code-block-wrapper .hljs-title),
  :global(.code-block-wrapper .hljs-section),
  :global(.code-block-wrapper .hljs-type) {
    color: #6f42c1;
  }

  :global(.code-block-wrapper .hljs-comment),
  :global(.code-block-wrapper .hljs-quote) {
    color: #6a737d;
    font-style: italic;
  }

  :global(.code-block-wrapper .hljs-number),
  :global(.code-block-wrapper .hljs-attr) {
    color: #005cc5;
  }

  :global(.code-block-wrapper .hljs-variable),
  :global(.code-block-wrapper .hljs-template-variable) {
    color: #e36209;
  }

  /* Dark mode syntax highlighting */
  :global(.dark .code-block-wrapper .hljs-keyword),
  :global(.dark .code-block-wrapper .hljs-selector-tag),
  :global(.dark .code-block-wrapper .hljs-literal),
  :global(.dark .code-block-wrapper .hljs-built_in) {
    color: #ff7b72;
  }

  :global(.dark .code-block-wrapper .hljs-string),
  :global(.dark .code-block-wrapper .hljs-doctag) {
    color: #a5d6ff;
  }

  :global(.dark .code-block-wrapper .hljs-title),
  :global(.dark .code-block-wrapper .hljs-section),
  :global(.dark .code-block-wrapper .hljs-type) {
    color: #d2a8ff;
  }

  :global(.dark .code-block-wrapper .hljs-comment),
  :global(.dark .code-block-wrapper .hljs-quote) {
    color: #8b949e;
    font-style: italic;
  }

  :global(.dark .code-block-wrapper .hljs-number),
  :global(.dark .code-block-wrapper .hljs-attr) {
    color: #79c0ff;
  }

  :global(.dark .code-block-wrapper .hljs-variable),
  :global(.dark .code-block-wrapper .hljs-template-variable) {
    color: #ffa657;
  }
</style>
