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

    test('enforces the H1 title and shows its placeholder', async ({ page }) => {
      const editor = surface(page, framework, 'heading-enforcement');
      await editor.click();
      await page.keyboard.press('ControlOrMeta+a');
      await page.keyboard.press('Delete');
      // The titleHeading plugin restores the H1, so the first child stays an H1.
      await expect(async () => {
        const firstTag = await editor.evaluate((el) => el.firstElementChild?.tagName ?? '');
        expect(firstTag).toBe('H1');
      }).toPass();
      await expect(editor.locator('h1').first()).toHaveAttribute('data-placeholder', 'Untitled');
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
      const toolbarSurface = island(page, framework, 'bubble-menu')
        .getByRole('toolbar', { name: 'Text formatting' })
        .first();
      await expect(toolbar).toBeVisible();
      await expect(toolbarSurface).toHaveCSS('opacity', '1');

      // Stronger still: the toolbar must actually apply a mark.
      await toolbar.click();
      await expect(editor.locator('strong')).toHaveCount(1);

      await page.keyboard.press('Escape');
      if (framework === 'svelte') await expect(toolbarSurface).toHaveCSS('opacity', '0');
      else await expect(toolbarSurface).not.toBeVisible();

      await editor.click();
      if (framework === 'svelte') await expect(toolbarSurface).toHaveCSS('opacity', '0');
      else await expect(toolbarSurface).not.toBeVisible();
    });

    test('the slash menu opens with rich-block commands and locks its demo scroll', async ({ page }) => {
      const editor = surface(page, framework, 'slash-menu');
      const demoScroll = page.locator('[data-example-id="slash-menu"] [data-editor-demo-scroll]').first();
      await editor.locator('p').last().scrollIntoViewIfNeeded();
      await editor.locator('p').last().click();
      await page.keyboard.press('End');
      await page.keyboard.type('/');

      const menu = island(page, framework, 'slash-menu');
      for (const title of ['Heading 1', 'Quote', 'Notice', 'Table', 'YouTube', 'Mermaid']) {
        await expect(menu.getByText(title, { exact: true }).first()).toBeVisible();
      }

      const before = await demoScroll.evaluate((element) => element.scrollTop);
      await demoScroll.hover();
      await page.mouse.wheel(0, -200);
      await expect.poll(() => demoScroll.evaluate((element) => element.scrollTop)).toBe(before);
    });

    test('applies an actual highlight color and marks the control active', async ({ page }) => {
      const editor = surface(page, framework, 'bubble-menu');
      const para = editor.locator('p').first();
      await para.click();
      await para.evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      });

      const highlight = island(page, framework, 'bubble-menu')
        .getByLabel(/highlight/i)
        .first();
      await highlight.click();
      // React portals Ark Popover content to document.body; Svelte renders its picker in place.
      // getByRole excludes the hidden framework, so the visible swatch is unambiguous.
      await page
        .getByRole('button', { name: /^blue$/i })
        .first()
        .click();
      await expect(editor.locator('mark').first()).toHaveCSS('background-color', 'rgb(219, 234, 254)');
      await expect(highlight).toHaveAttribute('data-state', 'on');
    });

    test('uploads, previews, inserts, and exits an image caption', async ({ page }) => {
      const editor = surface(page, framework, 'slash-menu');
      await editor.locator('p').last().scrollIntoViewIfNeeded();
      await editor.locator('p').last().click();
      await page.keyboard.press('End');
      await page.keyboard.type('/');
      await island(page, framework, 'slash-menu').getByText('Image', { exact: true }).first().click();

      const upload = island(page, framework, 'slash-menu');
      await upload.locator('input[type="file"]').setInputFiles({
        name: 'tiny.png',
        mimeType: 'image/png',
        buffer: Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          'base64',
        ),
      });
      await expect(upload.getByRole('img', { name: 'tiny.png' })).toBeVisible();
      await upload
        .getByRole('button', { name: /^upload$/i })
        .last()
        .click();

      const caption = editor.locator('.caption-input').last();
      await expect(caption).toBeVisible();
      const paragraphCount = await editor.locator('p').count();
      await caption.fill('A tiny image');
      await caption.press('Enter');
      await expect(editor.locator('p')).toHaveCount(paragraphCount + 1);
      await expect(caption).toHaveValue('A tiny image');
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
