<!-- apps/docs/src/components/examples/chat/default/svelte.svelte -->
<script lang="ts">
  import { Chat, ChatThread, ChatMessage, ChatInput } from '@cloudvoyant/vortex-svelte';
</script>

<Chat layout="slack" class="mx-auto h-96 w-full max-w-md">
  <ChatThread>
    <ChatMessage variant="default" from="Ada" at={new Date('2024-01-01T09:00:00')}>
      Morning! Did the deploy finish?
    </ChatMessage>
    <ChatMessage variant="user" from="You" at={new Date('2024-01-01T09:01:00')}>
      Yep, green across the board.
    </ChatMessage>
    <ChatMessage variant="default" from="Ada" at={new Date('2024-01-01T09:02:00')}>🎉</ChatMessage>
  </ChatThread>
  <ChatInput placeholder="Message the team…" onSend={() => {}} />
</Chat>
