// apps/docs/e2e/listbox.spec.ts
// Behavior coverage for Listbox, over both frameworks via the docs demo islands.
//
// NOTE: Ark's listbox input does NOT filter — nothing in zag's getInputProps touches the
// collection. The filtering test below therefore exercises the EXAMPLE's consumer-owned
// filtering (it proves our wrapper doesn't swallow value/onChange), not a library feature.
// What ListboxInput actually contributes — arrow-key forwarding and the aria-activedescendant
// linkage to the list — is covered by the dedicated test at the end.
import { selectFramework } from './helpers';
import { test, expect, type Page } from '@playwright/test';

const FRAMEWORKS = ['react', 'svelte'] as const;

function scope(page: Page, framework: string, example: string) {
  return page.locator(`[data-example-id="${example}"] [data-example-preview] [data-fw="${framework}"]`);
}

for (const framework of FRAMEWORKS) {
  test.describe(`Listbox docs page · ${framework}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('components/listbox');
      await selectFramework(page, framework);
    });

    test('renders listbox items', async ({ page }) => {
      const items = scope(page, framework, 'default').locator('[data-part="item"]');
      await expect(items.first()).toBeVisible();
      await expect(items).toHaveCount(4);
    });

    test('consumer-owned filtering narrows the rendered options', async ({ page }) => {
      const s = scope(page, framework, 'filtering');
      const input = s.locator('input').first();
      const options = s.getByRole('option');
      await expect(options).toHaveCount(5);

      // 'app' matches exactly one of the five fruit labels — assert the exact remainder so the
      // test cannot pass if filtering over-filtered to zero.
      await input.fill('app');
      await expect(options).toHaveCount(1);
      await expect(options.first()).toHaveText(/Apple/);
    });

    test('multiple mode marks more than one item selected', async ({ page }) => {
      const s = scope(page, framework, 'multiple');
      await expect(s.getByRole('option').first()).toBeVisible();
      // Ark marks selection with aria-selected on the option role, not data-state.
      await expect(s.getByRole('option', { selected: true })).toHaveCount(2);
    });

    // The actual reason to wrap Ark's input: it owns the list linkage, so arrow keys move the
    // list's active option and the surface advertises it via aria-activedescendant.
    // Focus alone does NOT give the list an active option — Ark (zag) assigns one only once a
    // navigation key is pressed — so the attribute is asserted after ArrowDown, never before.
    // `autoHighlight` means an option may ALREADY be highlighted on focus, so asserting "one is
    // highlighted" would pass even if ArrowDown did nothing. Assert the active option CHANGED.
    test('ListboxInput forwards arrow keys to the list and tracks the active option', async ({ page }) => {
      const s = scope(page, framework, 'filtering');
      const input = s.locator('input').first();
      const content = s.locator('[data-part="content"]');

      await input.click();
      await input.press('ArrowDown');

      await expect(content).toHaveAttribute('aria-activedescendant', /.+/);
      const first = await content.getAttribute('aria-activedescendant');

      // A second press must move the active option, which proves the input drives the list.
      await input.press('ArrowDown');
      await expect(async () => {
        expect(await content.getAttribute('aria-activedescendant')).not.toBe(first);
      }).toPass();
      // Ark stamps data-highlighted on more than one part per option, so scope to the item part.
      await expect(s.locator('[data-part="item"][data-highlighted]')).toHaveCount(1);
    });
  });
}
