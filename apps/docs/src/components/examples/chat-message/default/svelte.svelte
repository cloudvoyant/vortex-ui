<!-- apps/docs/src/components/examples/chat-message/default/svelte.svelte -->
<script lang="ts">
  import { ChatMessage } from '@cloudvoyant/vortex-svelte';
</script>

<div class="w-full max-w-md">
  <ChatMessage variant="default" from="User A" at={new Date('2026-09-05T14:32:00')}>
    Hey — did you get a chance to look at the PR?
  </ChatMessage>
</div>
