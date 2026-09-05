// apps/docs/e2e/agentic-chat.spec.ts
// Behavior coverage for AgentChat, matrixed over React and Svelte via the docs
// demo islands: sending a message streams an agent reply through the status
// transitions and renders markdown. Svelte lands in Phase 4; its rows are
// skipped until then (Phase 5 removes this guard).
import { selectFramework } from './helpers';
import { test, expect } from '@playwright/test';

const FRAMEWORKS = ['react', 'svelte'] as const;

for (const framework of FRAMEWORKS) {
  test.describe(`AgentChat docs page · ${framework}`, () => {
    test.skip(framework === 'svelte', 'svelte not yet implemented');

    test('streams an agent reply and renders it', async ({ page }) => {
      await page.goto('components/agentic-chat');
      await selectFramework(page, framework);

      const island = page.locator(`[data-demo] [data-fw="${framework}"]`).first();
      const input = island.locator('textarea').first();
      await input.fill('Hello agent');
      await input.press('Enter');

      const thread = island.locator('[data-agent-thread]').first();
      await expect(thread.getByText('Hello agent')).toBeVisible();
      // The agent reply is markdown-rendered and lands after streaming completes.
      await expect(island.locator('[data-chat-markdown]').first()).toBeVisible({ timeout: 15_000 });
    });
  });
}
