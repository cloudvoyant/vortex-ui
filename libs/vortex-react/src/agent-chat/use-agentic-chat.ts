// libs/vortex-react/src/agent-chat/use-agentic-chat.ts
// Composed for vortex-ui; React hook over the framework-agnostic agentic reducer.
import { useReducer, useCallback, useMemo } from 'react';
import {
  agenticChatReducer,
  makeInitialAgenticChatState,
  type AgenticMessage,
  type AgentStreamingState,
} from '@cloudvoyant/vortex-ui';

export interface UseAgenticChatOptions {
  initialMessages?: AgenticMessage[];
}

export function useAgenticChat(options: UseAgenticChatOptions = {}) {
  const [state, dispatch] = useReducer(agenticChatReducer, options.initialMessages ?? [], makeInitialAgenticChatState);

  const addMessage = useCallback((message: AgenticMessage) => dispatch({ type: 'addMessage', message }), []);
  const prependMessages = useCallback(
    (messages: AgenticMessage[]) => dispatch({ type: 'prependMessages', messages }),
    [],
  );
  const setStreaming = useCallback(
    (streaming: Partial<AgentStreamingState>) => dispatch({ type: 'setStreaming', streaming }),
    [],
  );

  return useMemo(
    () => ({
      messages: state.messages,
      streaming: state.streaming,
      addMessage,
      prependMessages,
      setStreaming,
    }),
    [state.messages, state.streaming, addMessage, prependMessages, setStreaming],
  );
}
