<!-- libs/vortex-svelte/src/chat-message/ChatMessageReactionPicker.svelte -->
<!-- Composed for vortex-ui on the vortex Popover; mirrored from @cloudvoyant/vortex-react -->
<script lang="ts">
  import { SmileyIcon, ThumbsUpIcon, ThumbsDownIcon } from 'phosphor-svelte';
  import {
    chatReactionPickerTriggerBase,
    chatReactionPickerGridBase,
    chatReactionPickerButtonBase,
    chatReactionRateBase,
    chatReactionRateButtonBase,
    DEFAULT_CHAT_EMOJIS,
    THUMBS_UP_KEY,
    THUMBS_DOWN_KEY,
    cn,
  } from '@cloudvoyant/vortex-ui';
  import type { ChatReactionPickerVariant } from '@cloudvoyant/vortex-ui';
  import { Popover, PopoverTrigger, PopoverContent } from '../popover';

  type Props = {
    variant?: ChatReactionPickerVariant;
    emojis?: readonly string[];
    onReact?: (key: string) => void;
    class?: string;
  };

  let { variant = 'emoji', emojis = DEFAULT_CHAT_EMOJIS, onReact, class: className = '' }: Props = $props();

  let open = $state(false);

  function pick(key: string) {
    onReact?.(key);
    open = false;
  }
</script>

<Popover {open} onOpenChange={(e) => (open = e.open)}>
  <PopoverTrigger
    class={cn(chatReactionPickerTriggerBase, className)}
    aria-label="Add reaction"
    data-reaction-picker={variant}
  >
    <SmileyIcon class="size-4" aria-hidden="true" />
  </PopoverTrigger>
  <PopoverContent class="w-auto p-2">
    {#if variant === 'rate'}
      <div class={chatReactionRateBase} role="menu" aria-label="Rate">
        <button
          type="button"
          role="menuitem"
          class={chatReactionRateButtonBase}
          data-reaction={THUMBS_UP_KEY}
          aria-label="Thumbs up"
          onclick={() => pick(THUMBS_UP_KEY)}
        >
          <ThumbsUpIcon class="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          role="menuitem"
          class={chatReactionRateButtonBase}
          data-reaction={THUMBS_DOWN_KEY}
          aria-label="Thumbs down"
          onclick={() => pick(THUMBS_DOWN_KEY)}
        >
          <ThumbsDownIcon class="size-4" aria-hidden="true" />
        </button>
      </div>
    {:else}
      <div class={chatReactionPickerGridBase} role="menu" aria-label="Add reaction">
        {#each emojis as emoji (emoji)}
          <button
            type="button"
            role="menuitem"
            class={chatReactionPickerButtonBase}
            data-emoji={emoji}
            aria-label={emoji}
            onclick={() => pick(emoji)}
          >
            {emoji}
          </button>
        {/each}
      </div>
    {/if}
  </PopoverContent>
</Popover>
