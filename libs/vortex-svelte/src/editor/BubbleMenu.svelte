<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Editor } from '@tiptap/core';
  import ColorPicker from './ColorPicker.svelte';
  import LinkEditPopover from './LinkEditPopover.svelte';
  import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Link2,
  } from 'lucide-svelte';

  interface Props {
    editor: Editor;
  }

  let props: Props = $props();

  let menu: HTMLDivElement = $state() as HTMLDivElement;
  let showLinkInput = $state(false);
  let linkUrl = $state('');
  let showColorPicker = $state(false);
  let showHighlightPicker = $state(false);
  let isVisible = $state(false);
  let currentTextColor = $state<string | null>(null);
  let currentHighlight = $state<string | null>(null);

  // Reset picker states when menu closes
  $effect(() => {
    if (!isVisible) {
      showColorPicker = false;
      showHighlightPicker = false;
      showLinkInput = false;
    }
  });

  // Color preview mapping - darker versions of highlights
  const colorPreviews: Record<string, string> = {
    yellow: '#f59e0b',
    blue: '#3b82f6',
    green: '#10b981',
    red: '#ef4444',
    fuchsia: '#d946ef',
    orange: '#f97316',
    violet: '#8b5cf6',
    cyan: '#06b6d4',
    slate: '#64748b',
  };

  const highlightPreviews: Record<string, string> = {
    yellow: '#fef9c3',
    blue: '#dbeafe',
    green: '#d1fae5',
    red: '#fee2e2',
    fuchsia: '#fae8ff',
    orange: '#ffedd5',
    violet: '#ede9fe',
    cyan: '#cffafe',
    slate: '#f1f5f9',
  };

  function updateColors() {
    if (!props.editor) return;
    currentTextColor = props.editor.getAttributes('textStyle')?.color || null;
    currentHighlight = props.editor.getAttributes('highlight')?.color || null;
  }

  function updatePosition() {
    if (!props.editor) return;

    const { from, to, empty } = props.editor.state.selection;

    // Hide if no selection
    if (empty || from === to) {
      isVisible = false;
      showLinkInput = false;
      return;
    }

    isVisible = true;
    updateColors();

    // Auto-show link popover when selecting a link
    const isLinkActive = props.editor.isActive('link');
    const isInternalMentionActive = props.editor.isActive('internalMention');

    if (isLinkActive && !isInternalMentionActive) {
      showLinkInput = true;
      const { href } = props.editor.getAttributes('link');
      linkUrl = href || '';
    } else {
      if (showLinkInput && !isLinkActive) {
        showLinkInput = false;
        linkUrl = '';
      }
    }

    // Defer positioning so the browser has time to finalize the native
    // selection — necessary for double-click which fires the transaction
    // event before the DOM selection is updated.
    requestAnimationFrame(() => {
      if (!menu || !isVisible) return;

      const nativeSelection = window.getSelection();
      let rect: DOMRect | null = null;
      if (nativeSelection && nativeSelection.rangeCount > 0) {
        rect = nativeSelection.getRangeAt(0).getBoundingClientRect();
      }

      let left: number;
      let top: number;
      let selectionBottom: number;

      if (!rect || rect.width === 0) {
        // Fall back to coordsAtPos
        const { view } = props.editor;
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        left = Math.round((start.left + end.left) / 2 - menu.offsetWidth / 2);
        top = Math.round(start.top - menu.offsetHeight - 8);
        selectionBottom = end.bottom;
      } else {
        left = Math.round(rect.left + rect.width / 2 - menu.offsetWidth / 2);
        top = Math.round(rect.top - menu.offsetHeight - 8);
        selectionBottom = rect.bottom;
      }

      // Mirror the React BubbleMenu, which uses floating-ui with `placement: 'top'` and flips to
      // the opposite side when the preferred side has no room. Without the flip a selection near
      // the top of the viewport parks the menu at a negative offset: offscreen and unclickable.
      const GAP = 8;
      if (top < GAP) {
        top = Math.round(selectionBottom + GAP);
      }

      // Same reasoning horizontally — a menu overflowing a viewport edge is partly unreachable.
      const maxLeft = window.innerWidth - menu.offsetWidth - GAP;
      left = Math.min(Math.max(left, GAP), Math.max(maxLeft, GAP));

      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      menu.style.transform = 'translateZ(0)';
    });
  }

  onMount(() => {
    if (!props.editor) return;

    // Update on selection change
    props.editor.on('selectionUpdate', updatePosition);
    props.editor.on('transaction', updatePosition);

    // Update on scroll
    const handleScroll = () => requestAnimationFrame(updatePosition);
    window.addEventListener('scroll', handleScroll, true);

    // Initial update
    requestAnimationFrame(updatePosition);

    return () => {
      props.editor.off('selectionUpdate', updatePosition);
      props.editor.off('transaction', updatePosition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  });

  onDestroy(() => {
    // Cleanup handled by onMount return
  });

  function toggleBold() {
    props.editor.chain().focus().toggleBold().run();
  }

  function toggleItalic() {
    props.editor.chain().focus().toggleItalic().run();
  }

  function toggleUnderline() {
    props.editor.chain().focus().toggleUnderline().run();
  }

  function toggleStrike() {
    props.editor.chain().focus().toggleStrike().run();
  }

  function toggleLink() {
    // Always show input to add or edit link
    showLinkInput = true;
    const { href } = props.editor.getAttributes('link');
    linkUrl = href || '';
  }

  function setTextAlign(alignment: 'left' | 'center' | 'right' | 'justify') {
    props.editor.chain().focus().setTextAlign(alignment).run();
  }

</script>

<div
  bind:this={menu}
  class="fixed z-50 flex items-center gap-1 rounded-lg border bg-popover text-popover-foreground p-1 shadow-lg transition-opacity"
  style="opacity: {isVisible ? 1 : 0}; pointer-events: {isVisible ? 'auto' : 'none'}"
>
  <!-- Text formatting -->
  <button
    type="button"
    class="rounded px-3 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive('bold')
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={toggleBold}
    aria-label="Bold"
    title="Bold"
  >
    <strong>B</strong>
  </button>
  <button
    type="button"
    class="rounded px-3 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive('italic')
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={toggleItalic}
    aria-label="Italic"
    title="Italic"
  >
    <em>I</em>
  </button>
  <button
    type="button"
    class="rounded px-3 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive('underline')
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={toggleUnderline}
    aria-label="Underline"
    title="Underline"
  >
    <u>U</u>
  </button>
  <button
    type="button"
    class="rounded px-3 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive('strike')
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={toggleStrike}
    aria-label="Strikethrough"
    title="Strikethrough"
  >
    <s>S</s>
  </button>

  <!-- Divider -->
  <div class="w-px h-6 bg-border mx-1"></div>

  <!-- Color and Highlight -->
  <div class="relative">
    <button
      type="button"
      class="rounded px-3 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive('highlight')
        ? 'bg-accent text-accent-foreground'
        : ''}"
      onclick={() => (showHighlightPicker = !showHighlightPicker)}
      aria-label="Highlight"
      title="Highlight"
    >
      <span class="relative inline-block">
        H
        {#if currentHighlight && highlightPreviews[currentHighlight]}
          <span
            class="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
            style="background-color: {highlightPreviews[currentHighlight]}"
          ></span>
        {/if}
      </span>
    </button>
    <ColorPicker editor={props.editor} bind:visible={showHighlightPicker} mode="highlight" />
  </div>
  <div class="relative">
    <button
      type="button"
      class="rounded px-3 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive('textColor')
        ? 'bg-accent text-accent-foreground'
        : ''}"
      onclick={() => (showColorPicker = !showColorPicker)}
      aria-label="Text Color"
      title="Text Color"
    >
      <span class="relative inline-block">
        A
        {#if currentTextColor && colorPreviews[currentTextColor]}
          <span
            class="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
            style="background-color: {colorPreviews[currentTextColor]}"
          ></span>
        {/if}
      </span>
    </button>
    <ColorPicker editor={props.editor} bind:visible={showColorPicker} mode="color" />
  </div>

  <!-- Link -->
  <button
    type="button"
    class="rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive('link')
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={toggleLink}
    aria-label="Link"
    title="Link"
  >
    <Link2 size={16} />
  </button>

  <!-- Divider -->
  <div class="w-px h-6 bg-border mx-1"></div>

  <!-- Alignment -->
  <button
    type="button"
    class="rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive({
      textAlign: 'left',
    })
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={() => setTextAlign('left')}
    aria-label="Align left"
    title="Align left"
  >
    <AlignLeft size={16} />
  </button>
  <button
    type="button"
    class="rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive({
      textAlign: 'center',
    })
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={() => setTextAlign('center')}
    aria-label="Align center"
    title="Align center"
  >
    <AlignCenter size={16} />
  </button>
  <button
    type="button"
    class="rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive({
      textAlign: 'right',
    })
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={() => setTextAlign('right')}
    aria-label="Align right"
    title="Align right"
  >
    <AlignRight size={16} />
  </button>
  <button
    type="button"
    class="rounded px-2 py-1 hover:bg-accent hover:text-accent-foreground {props.editor.isActive({
      textAlign: 'justify',
    })
      ? 'bg-accent text-accent-foreground'
      : ''}"
    onclick={() => setTextAlign('justify')}
    aria-label="Justify"
    title="Justify"
  >
    <AlignJustify size={16} />
  </button>

</div>

{#if showLinkInput && menu && props.editor}
  {#if props.editor.state.selection.from !== props.editor.state.selection.to}
    {@const { to } = props.editor.state.selection}
    {@const coords = props.editor.view.coordsAtPos(to)}
    <div style="position: fixed; left: {menu.style.left}; top: {coords.bottom + 8}px; z-index: 60;">
      <LinkEditPopover
        editor={props.editor}
        initialUrl={linkUrl}
        onClose={() => {
          showLinkInput = false;
          linkUrl = '';
        }}
      />
    </div>
  {/if}
{/if}
