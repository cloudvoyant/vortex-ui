<script lang="ts">
  import type { Editor } from '@tiptap/core';
  import type { ImageUploadResult } from '@cloudvoyant/vortex-ui';

  interface Props {
    editor: Editor;
    position: number;
    onClose: () => void;
    /** Seam: replaces the source editor's app-specific uploader (was @readership/ui). */
    onUpload?: (file: File) => Promise<ImageUploadResult>;
  }

  let { editor, position, onClose, onUpload }: Props = $props();

  let activeTab = $state<'upload' | 'url'>('upload');
  let urlValue = $state('');
  let urlError = $state('');
  let urlInputEl: HTMLInputElement | undefined = $state();
  let uploading = $state(false);
  let uploadError = $state('');

  $effect(() => {
    if (activeTab === 'url') {
      urlInputEl?.focus();
    }
  });

  function insertImage(src: string, srcset?: string) {
    editor.chain().focus().setTextSelection(position).insertImage({ src, srcset, alt: '', caption: '' }).run();
    onClose();
  }

  async function handleFileSelect(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !onUpload) return;

    uploading = true;
    uploadError = '';
    try {
      const result = await onUpload(file);
      insertImage(result.src, result.srcset);
    } catch {
      uploadError = 'Upload failed. Please try again.';
    } finally {
      uploading = false;
    }
  }

  function handleUrlSubmit() {
    const trimmed = urlValue.trim();
    if (!trimmed) {
      urlError = 'Please enter a URL';
      return;
    }
    try {
      new URL(trimmed);
    } catch {
      urlError = 'Please enter a valid URL';
      return;
    }
    insertImage(trimmed);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose();
  }

  function handleUrlKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleUrlSubmit();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  class="w-80 rounded-lg border border-border bg-popover text-popover-foreground p-4 shadow-xl"
  role="dialog"
  aria-label="Insert image"
  tabindex="-1"
  onkeydown={handleKeydown}
>
  <div class="space-y-3">
    <p class="text-sm font-semibold">Insert Image</p>
    <hr class="border-border/50" />

    <!-- Tabs -->
    <div class="flex gap-1 rounded-md bg-muted p-1">
      <button
        type="button"
        onclick={() => {
          activeTab = 'upload';
          urlError = '';
        }}
        class="flex-1 rounded px-3 py-1 text-xs font-medium transition-colors {activeTab === 'upload'
          ? 'bg-background shadow-sm'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        Upload
      </button>
      <button
        type="button"
        onclick={() => {
          activeTab = 'url';
          urlError = '';
        }}
        class="flex-1 rounded px-3 py-1 text-xs font-medium transition-colors {activeTab === 'url'
          ? 'bg-background shadow-sm'
          : 'text-muted-foreground hover:text-foreground'}"
      >
        URL
      </button>
    </div>

    {#if activeTab === 'upload'}
      <div class="space-y-2">
        <input
          type="file"
          accept="image/*"
          onchange={handleFileSelect}
          disabled={!onUpload || uploading}
          class="w-full text-sm file:mr-2 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground"
        />
        {#if !onUpload}
          <p class="text-xs text-muted-foreground">No upload handler was provided — use the URL tab.</p>
        {/if}
        {#if uploading}
          <p class="text-xs text-muted-foreground">Uploading…</p>
        {/if}
        {#if uploadError}
          <p class="text-xs text-destructive">{uploadError}</p>
        {/if}
      </div>
    {:else}
      <div class="space-y-2">
        <input
          type="url"
          bind:this={urlInputEl}
          bind:value={urlValue}
          onkeydown={handleUrlKeydown}
          oninput={() => {
            urlError = '';
          }}
          placeholder="https://example.com/image.jpg"
          class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {#if urlError}
          <p class="text-xs text-destructive">{urlError}</p>
        {/if}
        <button
          type="button"
          onclick={handleUrlSubmit}
          class="w-full rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Insert
        </button>
      </div>
    {/if}

    <div class="flex justify-end">
      <button type="button" onclick={onClose} class="px-3 py-1.5 text-sm rounded-md hover:bg-muted transition-colors">
        Cancel
      </button>
    </div>
  </div>
</div>
