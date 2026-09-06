<!-- apps/docs/src/components/examples/chat/default/svelte.svelte -->
<script lang="ts">
  import { Chat, ChatThread, ChatMessage, ChatInput } from '@cloudvoyant/vortex-svelte';

  interface SentMessage {
    id: string;
    text: string;
  }

  let sent = $state<SentMessage[]>([]);

  function handleSend(submit: { text: string }) {
    const text = submit.text.trim();
    if (!text) return;
    sent = [...sent, { id: `m-${Date.now()}`, text }];
  }
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
    {#each sent as m (m.id)}
      <ChatMessage variant="user" from="You" at={new Date()}>
        {m.text}
      </ChatMessage>
    {/each}
  </ChatThread>
  <ChatInput placeholder="Message the team…" onSend={handleSend} />
</Chat>
