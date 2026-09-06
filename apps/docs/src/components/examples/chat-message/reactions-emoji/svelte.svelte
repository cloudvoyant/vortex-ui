<!-- apps/docs/src/components/examples/chat-message/reactions-emoji/svelte.svelte -->
<script lang="ts">
  import { ChatMessage, ChatMessageReactions, ChatMessageReactionPicker } from '@cloudvoyant/vortex-svelte';
  import type { ChatReactions } from '@cloudvoyant/vortex-ui';

  let reactions = $state<ChatReactions>({ '👍': 2, '🎉': 1 });
  const react = (key: string) => (reactions = { ...reactions, [key]: (reactions[key] ?? 0) + 1 });
</script>

<div class="flex w-full max-w-md flex-col gap-2">
  <ChatMessage variant="default" from="User C" at={new Date('2026-09-05T14:40:00')}>Ship it! 🚀</ChatMessage>
  <div class="flex items-center gap-2">
    <ChatMessageReactions {reactions} onReact={react} />
    <ChatMessageReactionPicker variant="emoji" onReact={react} />
  </div>
</div>
