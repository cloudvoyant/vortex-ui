// libs/vortex-svelte/src/chat-message/ChatContext.svelte.ts
// Source: @cloudvoyant/vortex-react chat-message ChatContext (composed for vortex-ui)
import { getContext, setContext } from 'svelte';
import type { ChatLayout } from '@cloudvoyant/vortex-ui';

export const CHAT_LAYOUT_KEY = Symbol('vortex-ui.chat-layout');

export function setChatLayout(layout: ChatLayout) {
  setContext(CHAT_LAYOUT_KEY, layout);
}

export function getChatLayout(): ChatLayout {
  return getContext<ChatLayout>(CHAT_LAYOUT_KEY) ?? 'slack';
}
