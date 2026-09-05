<!-- apps/docs/src/components/examples/chat-message/reactions-rate/svelte.svelte -->
<script lang="ts">
  import { ChatMessage, ChatMessageReactions, ChatMessageReactionPicker } from '@cloudvoyant/vortex-svelte';
  import type { ChatReactions } from '@cloudvoyant/vortex-ui';

  let reactions = $state<ChatReactions>({});
  const react = (key: string) => (reactions = { ...reactions, [key]: (reactions[key] ?? 0) + 1 });
</script>

<div class="flex w-full max-w-md flex-col gap-2">
  <ChatMessage variant="agent" from="Assistant" at={new Date('2026-09-05T14:41:00')}>
    Here is the refactored function. Let me know if this works for you.
  </ChatMessage>
  <div class="flex items-center gap-2">
    <ChatMessageReactions {reactions} onReact={react} />
    <ChatMessageReactionPicker variant="rate" onReact={react} />
  </div>
</div>
