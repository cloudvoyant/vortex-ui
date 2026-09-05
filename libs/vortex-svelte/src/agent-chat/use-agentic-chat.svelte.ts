// libs/vortex-svelte/src/agent-chat/use-agentic-chat.svelte.ts
// Composed for vortex-ui; Svelte 5 runes store over the framework-agnostic agentic
// reducer. Same return shape as the React useAgenticChat hook.
import {
  agenticChatReducer,
  makeInitialAgenticChatState,
  type AgenticMessage,
  type AgentStreamingState,
  type AgenticChatState,
} from '@cloudvoyant/vortex-ui';

export interface UseAgenticChatOptions {
  initialMessages?: AgenticMessage[];
}

export function useAgenticChat(options: UseAgenticChatOptions = {}) {
  let state = $state<AgenticChatState>(makeInitialAgenticChatState(options.initialMessages ?? []));

  return {
    get messages() {
      return state.messages;
    },
    get streaming() {
      return state.streaming;
    },
    addMessage(message: AgenticMessage) {
      state = agenticChatReducer(state, { type: 'addMessage', message });
    },
    prependMessages(messages: AgenticMessage[]) {
      state = agenticChatReducer(state, { type: 'prependMessages', messages });
    },
    setStreaming(streaming: Partial<AgentStreamingState>) {
      state = agenticChatReducer(state, { type: 'setStreaming', streaming });
    },
  };
}
