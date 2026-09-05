// apps/docs/e2e/chat-message.spec.ts
// Behavior + accessibility coverage for ChatMessage, matrixed over React and
// Svelte via the docs demo islands: identity variants render, reactions persist
// on click, and the reaction picker opens/dismisses via Ark's popover.
import { selectFramework } from './helpers';
import { test, expect } from '@playwright/test';

const FRAMEWORKS = ['react', 'svelte'] as const;

for (const framework of FRAMEWORKS) {
  test.describe(`ChatMessage docs page · ${framework}`, () => {
    // Svelte parity lands in Phase 4 — until its demo islands render, skip the
    // Svelte matrix rows. Phase 5 removes this guard once Svelte is implemented.
    test.skip(framework === 'svelte', 'svelte not yet implemented');

    test('renders identity variants', async ({ page }) => {
      await page.goto('components/chat-message');
      await selectFramework(page, framework);
      const variants = page.locator('[data-example-id="variants"]').locator(`[data-fw="${framework}"]`);
      await expect(variants.locator('[data-from="default"]').first()).toBeVisible();
      await expect(variants.locator('[data-from="user"]').first()).toBeVisible();
      await expect(variants.locator('[data-from="agent"]').first()).toBeVisible();
      await expect(variants.locator('[data-state="sending"]').first()).toBeVisible();
    });

    test('emoji reactions persist on click', async ({ page }) => {
      await page.goto('components/chat-message');
      await selectFramework(page, framework);
      const demo = page.locator('[data-example-id="reactions-emoji"]').locator(`[data-fw="${framework}"]`);
      const thumbsChip = demo.locator('[data-reaction="👍"]').first();
      await expect(thumbsChip).toContainText('2');
      await expect(async () => {
        await thumbsChip.click();
        await expect(thumbsChip).toContainText('3');
      }).toPass();
    });

    test('reaction picker opens and adds a reaction', async ({ page }) => {
      await page.goto('components/chat-message');
      await selectFramework(page, framework);
      const demo = page.locator('[data-example-id="reactions-rate"]').locator(`[data-fw="${framework}"]`);
      await demo.locator('[data-reaction-picker="rate"]').first().click();
      const upItem = page.locator('[role="menuitem"][data-reaction="thumbs-up"]').first();
      await expect(upItem).toBeVisible();
      await upItem.click();
      await expect(demo.locator('[data-reaction="thumbs-up"]').first()).toContainText('1');
    });
  });
}
