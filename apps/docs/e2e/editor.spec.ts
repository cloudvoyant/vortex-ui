// apps/docs/e2e/editor.spec.ts
// Behavior + parity coverage for the Editor, over both frameworks, via the docs editor examples.
//
// Selector convention comes from Example.astro: an example is keyed by [data-example-id], its
// live preview by [data-example-preview], and the per-framework island by [data-fw].
//
// Assertions target ProseMirror DOM and VISIBLE MENU CONTENT rather than internal markup: the
// Svelte menus are the faithful source port (plain lists of buttons with icons) while the React
// menus render through vortex Listbox, so role-based assertions would over-constrain one of them.
// Behaviour (the menu opens and shows the right items) is what parity actually requires.
//
// NOT covered here, deliberately: paste-a-URL and image-upload flows depend on clipboard and
// file dialogs that Playwright drives unreliably. `mentionSource` and `hrefBuilder` are covered
// by libs/vortex-ui/tests/editorSeams.test.ts; the `onUpload` seam is covered there too.
import { selectFramework } from './helpers';
import { test, expect, type Page } from '@playwright/test';

const FRAMEWORKS = ['react', 'svelte'] as const;

function island(page: Page, framework: string, example: string) {
  return page.locator(`[data-example-id="${example}"] [data-example-preview] [data-fw="${framework}"]`);
}

function surface(page: Page, framework: string, example: string) {
  return island(page, framework, example).locator('.ProseMirror').first();
}

for (const framework of FRAMEWORKS) {
  test.describe(`Editor · ${framework}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('components/editor');
      await selectFramework(page, framework);
    });

    test('mounts with the seeded H1 title', async ({ page }) => {
      const h1 = surface(page, framework, 'default').locator('h1').first();
      await expect(h1).toHaveText(/Getting Started/);
    });

    test('enforces the H1 title on select-all delete', async ({ page }) => {
      const editor = surface(page, framework, 'heading-enforcement');
      await editor.click();
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.press('Delete');
      // The titleHeading plugin restores the H1, so the first child stays an H1.
      await expect(async () => {
        const firstTag = await editor.evaluate((el) => el.firstElementChild?.tagName ?? '');
        expect(firstTag).toBe('H1');
      }).toPass();
    });

    test('persists typed body text', async ({ page }) => {
      const editor = surface(page, framework, 'default');
      await editor.locator('p').first().click();
      await page.keyboard.press('End');
      await page.keyboard.type(' EXTRA_TEXT');
      await expect(editor).toContainText('EXTRA_TEXT');
    });

    test('markdown input rule turns "## " into an h2', async ({ page }) => {
      const editor = surface(page, framework, 'slash-menu');
      await editor.locator('p').last().click();
      await page.keyboard.type('## Section');
      await expect(editor.locator('h2')).toContainText('Section');
    });

    test('the bubble menu appears on selection', async ({ page }) => {
      const editor = surface(page, framework, 'bubble-menu');
      const para = editor.locator('p').first();
      await para.click();
      await para.evaluate((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      });

      // Svelte's BubbleMenu is always in the DOM and hides with `opacity: 0`, which
      // toBeVisible() ignores — so an opacity assertion is the only one that proves the menu
      // actually opened. Assert the toolbar is both present AND opaque.
      const toolbar = island(page, framework, 'bubble-menu').getByLabel(/bold/i).first();
      await expect(toolbar).toBeVisible();
      await expect(toolbar).toHaveCSS('opacity', '1');

      // Stronger still: the toolbar must actually apply a mark.
      await toolbar.click();
      await expect(editor.locator('strong')).toHaveCount(1);
    });

    test('the slash menu opens on "/" and shows commands', async ({ page }) => {
      const editor = surface(page, framework, 'slash-menu');
      await editor.locator('p').last().click();
      await page.keyboard.type('/');
      // A known command title proves the palette rendered with its items.
      await expect(island(page, framework, 'slash-menu').getByText('Heading 1').first()).toBeVisible();
    });

    test('the mention menu opens on "@" using the injected mentionSource', async ({ page }) => {
      const editor = surface(page, framework, 'mentions');
      await editor.click();
      await page.keyboard.type('@a');
      // The mention menu mounts into document.body (it follows the caret), NOT inside the
      // framework island — so it must be queried unscoped. Both frameworks use .mention-list.
      // Assert the count first: a menu leaked by the OTHER framework would otherwise satisfy
      // the visibility check and mask a broken one.
      const menu = page.locator('.mention-list');
      await expect(menu).toHaveCount(1);
      // The static mentionSource supplies these people; seeing one proves the seam is wired.
      await expect(
        menu
          .first()
          .getByText(/Ada Lovelace|Alan Turing/)
          .first(),
      ).toBeVisible();
    });
  });
}
