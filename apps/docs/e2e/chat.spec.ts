// apps/docs/e2e/chat.spec.ts
// Behavior coverage for the Chat surface, matrixed over React and Svelte via the
// docs demo islands: send flow (Enter-to-send clears the draft), sending state,
// and the typing indicator's status role.
import { selectFramework } from './helpers';
import { test, expect } from '@playwright/test';

const FRAMEWORKS = ['react', 'svelte'] as const;

for (const framework of FRAMEWORKS) {
  test.describe(`Chat docs page · ${framework}`, () => {
    // Svelte parity lands in Phase 4 — until its demo islands render, skip the
    // Svelte matrix rows. Phase 5 removes this guard once Svelte is implemented.
    test.skip(framework === 'svelte', 'svelte not yet implemented');

    test.beforeEach(async ({ page }) => {
      await page.goto('components/chat');
      await selectFramework(page, framework);
    });

    test('renders the thread messages', async ({ page }) => {
      const island = page.locator(`[data-example-id="default"] [data-fw="${framework}"]`).first();
      await expect(island.getByText('Morning! Did the deploy finish?')).toBeVisible();
      await expect(island.getByText('Yep, green across the board.')).toBeVisible();
    });

    test('Enter sends and clears the draft', async ({ page }) => {
      const island = page.locator(`[data-example-id="default"] [data-fw="${framework}"]`).first();
      const draft = island.locator('[data-draft]');
      await draft.fill('Hello there');
      await draft.press('Enter');
      await expect(draft).toHaveValue('');
    });

    test('sending state renders at reduced opacity bubble', async ({ page }) => {
      const island = page.locator(`[data-example-id="sending-state"] [data-fw="${framework}"]`).first();
      const sending = island.locator('[data-state="sending"]').first();
      await expect(sending).toBeVisible();
    });

    test('typing indicator exposes a status role', async ({ page }) => {
      const island = page.locator(`[data-example-id="typing-indicator"] [data-fw="${framework}"]`).first();
      await expect(island.locator('[data-typing]')).toHaveAttribute('role', 'status');
    });
  });
}
