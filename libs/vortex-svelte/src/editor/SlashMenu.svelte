<script lang="ts">
  import type { SlashCommandItem } from '@cloudvoyant/vortex-ui';
  import { onMount, tick } from 'svelte';
  import * as LucideIcons from 'lucide-svelte';
  import type { Component } from 'svelte';

  interface Props {
    items: SlashCommandItem[];
    command: (item: SlashCommandItem) => void;
  }

  let { items, command }: Props = $props();

  let selectedIndex = $state(0);
  let previousItems = $state<SlashCommandItem[] | undefined>();
  let itemElements = $state<Array<HTMLButtonElement | undefined>>([]);

  function getIcon(iconName: string): Component | undefined {
    return (LucideIcons as unknown as Record<string, Component | undefined>)[iconName];
  }

  function setSelectedIndex(index: number) {
    selectedIndex = index;
    void tick().then(() => itemElements[index]?.scrollIntoView({ block: 'nearest' }));
  }

  // A new query supplies a new item set, so selection starts at its first command instead of
  // retaining an index into the previous result set.
  $effect(() => {
    if (items !== previousItems) {
      previousItems = items;
      setSelectedIndex(0);
    }
  });

  function selectItem(index: number) {
    const item = items[index];
    if (item) {
      command(item);
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (items.length === 0) return false;

    if (event.key === 'ArrowUp') {
      setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
      return true;
    }

    if (event.key === 'ArrowDown') {
      setSelectedIndex((selectedIndex + 1) % items.length);
      return true;
    }

    if (event.key === 'Enter') {
      selectItem(selectedIndex);
      return true;
    }

    return false;
  }

  onMount(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (handleKeyDown(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Use capture phase to intercept before editor
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  });
</script>

{#if items.length > 0}
  <div class="w-72 rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
    <div class="max-h-[320px] overflow-y-auto p-1">
      {#each items as item, index}
        {@const IconComponent = getIcon(item.icon)}
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-popover-foreground hover:bg-accent hover:text-accent-foreground {index ===
          selectedIndex
            ? 'bg-accent text-accent-foreground'
            : ''}"
          bind:this={itemElements[index]}
          onclick={() => selectItem(index)}
          onmouseenter={() => setSelectedIndex(index)}
        >
          <span class="inline-flex w-5 justify-center opacity-70">
            {#if IconComponent}
              <IconComponent size={16} />
            {/if}
          </span>
          <div class="flex-1 min-w-0">
            <span class="text-sm">{item.title}</span>
          </div>
        </button>
      {/each}
    </div>
  </div>
{/if}
