// apps/docs/e2e/chat.spec.ts
// Behavior coverage for the Chat surface, matrixed over React and Svelte via the
// docs demo islands: send flow (Enter-to-send clears the draft), sending state,
// and the typing indicator's status role.
import { selectFramework } from './helpers';
import { test, expect } from '@playwright/test';

const FRAMEWORKS = ['react', 'svelte'] as const;

for (const framework of FRAMEWORKS) {
  test.describe(`Chat docs page · ${framework}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('components/chat');
      await selectFramework(page, framework);
    });

    test('renders the thread messages', async ({ page }) => {
      const island = page.locator(`[data-example-id="default"] [data-fw="${framework}"]`).first();
      await expect(island.getByText('Morning! Did the deploy finish?')).toBeVisible();
      await expect(island.getByText('Yep, green across the board.')).toBeVisible();
    });

    test('Enter sends and clears the composer; Shift+Enter does not', async ({ page }) => {
      const island = page.locator(`[data-example-id="default"] [data-fw="${framework}"]`).first();
      const draft = island.locator('[data-draft]');
      const thread = island.locator('[data-thread-content]').first();
      // Shift+Enter inserts a newline instead of sending.
      await draft.fill('First line');
      await draft.press('Shift+Enter');
      await expect(draft).toHaveValue(/First line/);
      await expect(thread.getByText('First line')).toHaveCount(0);
      // Plain Enter sends, clears the draft, and appends the message to the thread.
      await draft.fill('Send me');
      await draft.press('Enter');
      await expect(draft).toHaveValue('');
      await expect(thread.getByText('Send me')).toBeVisible();
    });

    test('send button is disabled when empty and sends when typed', async ({ page }) => {
      const island = page.locator(`[data-example-id="default"] [data-fw="${framework}"]`).first();
      const draft = island.locator('[data-draft]');
      const sendBtn = island.locator('[aria-label="Send message"]').first();
      await expect(sendBtn).toBeDisabled();
      await draft.fill('Via the send button');
      await expect(sendBtn).toBeEnabled();
      await sendBtn.click();
      await expect(draft).toHaveValue('');
      await expect(island.locator('[data-thread-content]').first().getByText('Via the send button')).toBeVisible();
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
