<script lang="ts">
  import { onMount } from 'svelte';
  import type { Editor } from '@tiptap/core';
  import { Bookmark, MessageCircle, Link } from 'lucide-svelte';

  interface Props {
    editor: Editor;
    url: string;
    position: number;
    onClose: () => void;
  }

  let { editor, url, position, onClose }: Props = $props();

  let isLoading = $state(true);
  let selectedIndex = $state(0);
  let metadata: {
    url: string;
    title: string;
    description: string;
    image?: string;
    favicon?: string;
  } | null = $state(null);

  onMount(async () => {
    try {
      const response = await fetch(`/api/link-preview?url=${encodeURIComponent(url)}`);
      if (response.ok) {
        metadata = await response.json();
      }
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    } finally {
      isLoading = false;
    }
  });

  function handleBookmark() {
    if (!metadata) return;

    editor
      .chain()
      .focus()
      .setTextSelection({ from: position, to: position + url.length })
      .deleteSelection()
      .insertLinkPreview({
        url: metadata.url,
        title: metadata.title,
        description: metadata.description,
        image: metadata.image ?? null,
        favicon: metadata.favicon ?? null,
        provider: new URL(url).hostname,
        type: 'bookmark',
      })
      .run();

    onClose();
  }

  function handleMention() {
    if (!metadata) return;

    editor
      .chain()
      .focus()
      .setTextSelection({ from: position, to: position + url.length })
      .deleteSelection()
      .insertUrlMention({
        url: metadata.url,
        title: metadata.title,
        favicon: metadata.favicon ?? null,
      })
      .run();

    onClose();
  }

  function handleUrl() {
    editor
      .chain()
      .focus()
      .setTextSelection({ from: position, to: position + url.length })
      .deleteSelection()
      .insertContent({
        type: 'text',
        marks: [
          {
            type: 'link',
            attrs: { href: url },
          },
        ],
        text: url,
      })
      .run();

    onClose();
  }

  function selectItem(index: number) {
    if (index === 0) handleBookmark();
    else if (index === 1) handleMention();
    else if (index === 2) handleUrl();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowUp') {
      selectedIndex = (selectedIndex - 1 + 3) % 3;
      event.preventDefault();
      return;
    }

    if (event.key === 'ArrowDown') {
      selectedIndex = (selectedIndex + 1) % 3;
      event.preventDefault();
      return;
    }

    if (event.key === 'Enter') {
      selectItem(selectedIndex);
      event.preventDefault();
      return;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div
  class="w-72 rounded-md border border-border bg-popover text-popover-foreground shadow-lg"
  role="menu"
  aria-label="Paste options"
>
  <div class="p-1">
    <button
      type="button"
      onclick={handleBookmark}
      onmouseenter={() => (selectedIndex = 0)}
      disabled={isLoading || !metadata}
      class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed {selectedIndex ===
      0
        ? 'bg-accent text-accent-foreground'
        : ''}"
    >
      <span class="inline-flex w-5 justify-center opacity-70">
        <Bookmark size={16} />
      </span>
      <div class="flex-1 min-w-0">
        <span class="text-sm">Bookmark</span>
      </div>
      {#if isLoading}
        <div class="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
      {/if}
    </button>

    <button
      type="button"
      onclick={handleMention}
      onmouseenter={() => (selectedIndex = 1)}
      disabled={isLoading || !metadata}
      class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed {selectedIndex ===
      1
        ? 'bg-accent text-accent-foreground'
        : ''}"
    >
      <span class="inline-flex w-5 justify-center opacity-70">
        <MessageCircle size={16} />
      </span>
      <div class="flex-1 min-w-0">
        <span class="text-sm">Mention</span>
      </div>
      {#if isLoading}
        <div class="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full"></div>
      {/if}
    </button>

    <button
      type="button"
      onclick={handleUrl}
      onmouseenter={() => (selectedIndex = 2)}
      class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground {selectedIndex ===
      2
        ? 'bg-accent text-accent-foreground'
        : ''}"
    >
      <span class="inline-flex w-5 justify-center opacity-70">
        <Link size={16} />
      </span>
      <div class="flex-1 min-w-0">
        <span class="text-sm">URL</span>
      </div>
    </button>
  </div>
</div>
