// libs/vortex-ui/src/agentic-chat.ts
// Composed for vortex-ui; a framework-agnostic chat state machine for agentic
// (AI streaming) chat. Pure reducer + types — no React, no Svelte. The React
// hook and Svelte store wrap this identically so both frameworks share behavior.

export type AgentStreamStatus = 'Waiting' | 'Streaming' | 'Completed' | 'Retrying' | 'Cancelled';

export interface AgenticMessage {
  id: string;
  variant: 'default' | 'user' | 'agent';
  from?: string;
  at?: Date;
  content: string;
}

export interface AgentStreamingState {
  status: AgentStreamStatus;
  content: string;
}

export interface AgenticChatState {
  messages: AgenticMessage[];
  streaming: AgentStreamingState;
}

export type AgenticChatAction =
  | { type: 'addMessage'; message: AgenticMessage }
  | { type: 'prependMessages'; messages: AgenticMessage[] }
  | { type: 'setStreaming'; streaming: Partial<AgentStreamingState> };

export const initialAgenticChatState: AgenticChatState = {
  messages: [],
  streaming: { status: 'Completed', content: '' },
};

export function agenticChatReducer(state: AgenticChatState, action: AgenticChatAction): AgenticChatState {
  switch (action.type) {
    case 'addMessage':
      return {
        ...state,
        messages: [...state.messages, action.message],
        streaming: { status: 'Completed', content: '' },
      };
    case 'prependMessages':
      return { ...state, messages: [...action.messages, ...state.messages] };
    case 'setStreaming':
      return { ...state, streaming: { ...state.streaming, ...action.streaming } };
    default:
      return state;
  }
}

export function makeInitialAgenticChatState(messages: AgenticMessage[] = []): AgenticChatState {
  return { messages, streaming: { status: 'Completed', content: '' } };
}
