<script lang="ts">
  import type { EmojiItem } from '@cloudvoyant/vortex-ui';

  interface EmojiCommandArg {
    id: string;
    label: string;
  }

  let {
    items = [],
    command,
    clientRect,
  }: {
    items: EmojiItem[];
    command: (item: EmojiCommandArg) => void;
    clientRect: (() => DOMRect | null) | null;
  } = $props();

  let selectedIndex = $state(0);
  let element: HTMLElement;

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp') {
      selectedIndex = Math.max(0, selectedIndex - 1);
      return true;
    }
    if (event.key === 'ArrowDown') {
      selectedIndex = Math.min(items.length - 1, selectedIndex + 1);
      return true;
    }
    if (event.key === 'Enter') {
      selectItem(selectedIndex);
      return true;
    }
    return false;
  }

  function selectItem(index: number) {
    const item = items[index];
    if (item) {
      // Insert just the emoji character
      command({ id: item.name, label: item.emoji });
    }
  }

  // Position dropdown
  $effect(() => {
    if (element && clientRect) {
      const rect = clientRect();
      if (rect) {
        element.style.top = `${rect.bottom + window.scrollY}px`;
        element.style.left = `${rect.left + window.scrollX}px`;
      }
    }
  });

  // Reset selected index when items change
  $effect(() => {
    if (items.length > 0 && selectedIndex >= items.length) {
      selectedIndex = 0;
    }
  });

  // Expose onKeyDown for parent
  export function ref() {
    return { onKeyDown };
  }
</script>

<div bind:this={element} class="emoji-list">
  {#if items.length === 0}
    <div class="empty">No emojis found</div>
  {:else}
    <ul>
      {#each items as item, index}
        <li class:selected={index === selectedIndex}>
          <button type="button" class="emoji-item-button" onclick={() => selectItem(index)}>
            <div class="emoji">{item.emoji}</div>
            <div class="name">:{item.name}:</div>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .emoji-list {
    position: absolute;
    z-index: 1000;
    max-height: 300px;
    overflow-y: auto;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    min-width: 250px;
  }

  ul {
    list-style: none;
    padding: 0.5rem;
    margin: 0;
  }

  li {
    padding: 0;
    margin: 0;
  }

  .emoji-item-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    background: none;
    border: none;
    text-align: left;
  }

  .emoji-item-button:hover,
  li.selected .emoji-item-button {
    background: var(--bg-secondary);
  }

  .emoji {
    font-size: 1.25rem;
    line-height: 1;
  }

  .name {
    flex: 1;
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .empty {
    padding: 1rem;
    text-align: center;
    color: var(--text-muted);
  }
</style>
