// apps/docs/e2e/chat-message.spec.ts
// Behavior + accessibility coverage for ChatMessage, matrixed over React and
// Svelte via the docs demo islands: identity variants render, reactions persist
// on click, and the reaction picker opens/dismisses via Ark's popover.
import { selectFramework } from './helpers';
import { test, expect } from '@playwright/test';

const FRAMEWORKS = ['react', 'svelte'] as const;

for (const framework of FRAMEWORKS) {
  test.describe(`ChatMessage docs page · ${framework}`, () => {
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
      // The trigger may not be hydrated the instant the island paints (client:load),
      // so retry until the menu actually opens; target the visible menuitem only
      // (a closed popover's content may sit hidden in the DOM).
      const visibleUp = page.locator('[role="menuitem"][data-reaction="thumbs-up"]:visible').first();
      await expect(async () => {
        await demo.locator('[data-reaction-picker="rate"]').first().click();
        await expect(visibleUp).toBeVisible({ timeout: 2000 });
      }).toPass({ timeout: 15000 });
      await visibleUp.click();
      await expect(demo.locator('[data-reaction="thumbs-up"]').first()).toContainText('1');
    });

    test('reaction picker opens on Enter and dismisses on Escape', async ({ page }) => {
      await page.goto('components/chat-message');
      await selectFramework(page, framework);
      const scope = page.locator(`[data-example-id="reactions-emoji"] [data-fw="${framework}"]`).first();
      const trigger = scope.locator('[data-reaction-picker]').first();
      // Drive from the focused element (Ark popover keyboard support). Retry the
      // open in case the island is still hydrating.
      await expect(async () => {
        await trigger.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('[role="menu"][aria-label="Add reaction"]:visible').first()).toBeVisible({
          timeout: 2000,
        });
      }).toPass({ timeout: 15000 });
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="menu"][aria-label="Add reaction"]:visible')).toHaveCount(0);
    });
  });
}
