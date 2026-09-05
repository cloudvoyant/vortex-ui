<!-- apps/docs/src/components/examples/agentic-chat/streaming/svelte.svelte -->
<script lang="ts">
  import { AgentChat, AgentThread, AgentStreamingMessage, ChatInput, useAgenticChat } from '@cloudvoyant/vortex-svelte';
  import { onDestroy } from 'svelte';

  const LOREM = [
    'Sure — here is a short plan.',
    '1. Read the request and restate the goal.',
    '2. Draft a minimal solution first.',
    '3. Add tests, then refine.',
    'Done — let me know if you want more detail.',
  ].join('\n\n');

  const chat = useAgenticChat();
  let timers: ReturnType<typeof setTimeout>[] = [];

  onDestroy(() => timers.forEach(clearTimeout));

  function handleSend({ text }: { text: string }) {
    if (!text.trim()) return;
    chat.addMessage({ id: `u-${Date.now()}`, variant: 'user', from: 'You', at: new Date(), content: text });
    chat.setStreaming({ status: 'Waiting', content: '' });
    const words = LOREM.split(' ');
    timers.push(
      setTimeout(() => {
        let i = 0;
        const tick = () => {
          i += 1;
          chat.setStreaming({ status: 'Streaming', content: words.slice(0, i).join(' ') });
          if (i < words.length) {
            timers.push(setTimeout(tick, 40));
          } else {
            chat.addMessage({ id: `a-${Date.now()}`, variant: 'agent', from: 'Agent', at: new Date(), content: LOREM });
          }
        };
        tick();
      }, 400),
    );
  }
</script>

<AgentChat class="h-96 w-full max-w-lg gap-2">
  <AgentThread messages={chat.messages} class="flex-1" />
  <AgentStreamingMessage streaming={chat.streaming} />
  <ChatInput placeholder="Ask the agent…" onSend={handleSend} />
</AgentChat>
