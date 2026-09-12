<script lang="ts">
  import { onMount } from 'svelte';
  import type { Editor } from '@tiptap/core';

  interface Props {
    editor: Editor;
    position: number;
    onClose: () => void;
  }

  let { editor, position, onClose }: Props = $props();

  let url = $state('');
  let isLoading = $state(false);
  let error = $state('');
  let preview = $state<{
    url: string;
    title: string;
    description: string;
    image?: string;
    favicon?: string;
  } | null>(null);
  let inputElement: HTMLInputElement = $state() as HTMLInputElement;
  let debounceTimeout: ReturnType<typeof setTimeout>;

  onMount(() => {
    inputElement?.focus();
  });

  function isValidUrl(str: string): boolean {
    try {
      const url = new URL(str);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async function fetchPreview(urlToFetch: string) {
    if (!isValidUrl(urlToFetch)) {
      error = 'Please enter a valid URL';
      preview = null;
      return;
    }

    error = '';
    isLoading = true;

    try {
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(urlToFetch)}`);
      if (!response.ok) throw new Error('Failed to fetch metadata');

      const metadata = await response.json();
      preview = metadata;
    } catch (err) {
      console.error('Failed to fetch preview:', err);
      error = 'Failed to load preview. Please check the URL and try again.';
      preview = null;
    } finally {
      isLoading = false;
    }
  }

  function handleInput() {
    error = '';
    clearTimeout(debounceTimeout);

    if (!url.trim()) {
      preview = null;
      return;
    }

    debounceTimeout = setTimeout(() => {
      fetchPreview(url.trim());
    }, 500);
  }

  function handleCreate() {
    if (!preview) return;

    editor
      .chain()
      .focus()
      .setTextSelection(position)
      .insertLinkPreview({
        url: preview.url,
        title: preview.title,
        description: preview.description,
        image: preview.image ?? null,
        favicon: preview.favicon ?? null,
        provider: new URL(preview.url).hostname,
        type: 'bookmark',
      })
      .run();

    onClose();
  }

  function handleCancel() {
    onClose();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      handleCancel();
    } else if (event.key === 'Enter' && preview && !isLoading) {
      event.preventDefault();
      handleCreate();
    }
  }
</script>

<div
  class="w-96 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl"
  role="dialog"
  aria-label="Create bookmark"
>
  <div class="space-y-3">
    <div>
      <label for="bookmark-url" class="text-sm font-medium block mb-2"> Enter URL </label>
      <input
        id="bookmark-url"
        bind:this={inputElement}
        bind:value={url}
        oninput={handleInput}
        onkeydown={handleKeydown}
        type="text"
        placeholder="Paste in https://..."
        class="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>

    {#if error}
      <div class="text-sm text-red-500">{error}</div>
    {/if}

    {#if isLoading}
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <div class="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
        Loading preview...
      </div>
    {/if}

    {#if preview}
      <div class="rounded-md border border-border bg-muted/50 p-3">
        <div class="flex gap-3">
          {#if preview.favicon}
            <img src={preview.favicon} alt="" class="w-4 h-4 flex-shrink-0 mt-0.5" />
          {/if}
          <div class="flex-1 min-w-0">
            <div class="font-medium text-sm truncate">{preview.title}</div>
            {#if preview.description}
              <div class="text-xs text-muted-foreground line-clamp-2 mt-1">
                {preview.description}
              </div>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <div class="flex gap-2 justify-end">
      <button
        type="button"
        onclick={handleCancel}
        class="px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onclick={handleCreate}
        disabled={!preview || isLoading}
        class="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create bookmark
      </button>
    </div>
  </div>
</div>
