<!-- apps/docs/src/components/examples/chat/sending-state/svelte.svelte -->
<script lang="ts">
  import { Chat, ChatThread, ChatMessage, ChatInput } from '@cloudvoyant/vortex-svelte';
</script>

<Chat layout="ios" class="mx-auto h-96 w-full max-w-md">
  <ChatThread>
    <ChatMessage variant="default" from="Ada" at={new Date('2024-01-01T09:00:00')}>Can you send the notes?</ChatMessage>
    <ChatMessage variant="user" from="You" at={new Date('2024-01-01T09:01:00')} state="sent">On it.</ChatMessage>
    <ChatMessage variant="user" from="You" state="sending">Sharing the doc now…</ChatMessage>
  </ChatThread>
  <ChatInput placeholder="Message…" onSend={() => {}} />
</Chat>
