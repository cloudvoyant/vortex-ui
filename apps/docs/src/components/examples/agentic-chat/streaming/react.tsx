// apps/docs/src/components/examples/agentic-chat/streaming/react.tsx
import { useRef, useEffect } from 'react';
import { AgentChat, AgentThread, AgentStreamingMessage, ChatInput, useAgenticChat } from '@cloudvoyant/vortex-react';

const LOREM = [
  'Sure — here is a short plan.',
  '1. Read the request and restate the goal.',
  '2. Draft a minimal solution first.',
  '3. Add tests, then refine.',
  'Done — let me know if you want more detail.',
].join('\n\n');

export default function ReactAgenticChatStreaming() {
  const { messages, streaming, addMessage, setStreaming } = useAgenticChat();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    addMessage({ id: `u-${Date.now()}`, variant: 'user', from: 'You', at: new Date(), content: text });
    setStreaming({ status: 'Waiting', content: '' });
    const words = LOREM.split(' ');
    timers.current.push(
      setTimeout(() => {
        let i = 0;
        const tick = () => {
          i += 1;
          setStreaming({ status: 'Streaming', content: words.slice(0, i).join(' ') });
          if (i < words.length) {
            timers.current.push(setTimeout(tick, 40));
          } else {
            addMessage({
              id: `a-${Date.now()}`,
              variant: 'agent',
              from: 'Agent',
              at: new Date(),
              content: LOREM,
            });
          }
        };
        tick();
      }, 400),
    );
  };

  return (
    <AgentChat className="h-96 w-full max-w-lg gap-2">
      <AgentThread messages={messages} className="flex-1" />
      <AgentStreamingMessage streaming={streaming} />
      <ChatInput placeholder="Ask the agent…" onSend={(s) => handleSend(s.text)} />
    </AgentChat>
  );
}
