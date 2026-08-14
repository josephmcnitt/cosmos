import { test, expect } from '@playwright/test';
import { buildPanelScript } from '../../tools/bug-catcher/panelScript';
import { buildPlaytestLayoutInitScript } from '../../tools/bug-catcher/playtestLayout';
import { enterWalkMode, skipIntro } from './helpers';

test.describe('Playtest tool timeline visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({ content: buildPlaytestLayoutInitScript() });
    await page.addInitScript({ content: buildPanelScript({ mode: 'guidance' }) });
    await page.goto('/');
    await skipIntro(page);
  });

  test('time zoom slider and timeline playhead stay visible with playtest layout', async ({ page }) => {
    const temporal = page.getByTestId('temporal-zoom');
    const playhead = page.getByTestId('timeline-playhead');
    const scrubber = page.getByTestId('scrubber-track');

    await expect(temporal).toBeVisible();
    await expect(playhead).toBeVisible();
    await expect(scrubber).toBeVisible();

    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing viewport');

    const temporalBox = await temporal.boundingBox();
    const playheadBox = await playhead.boundingBox();
    if (!temporalBox || !playheadBox) throw new Error('Timeline controls missing layout boxes');

    expect(temporalBox.y + temporalBox.height).toBeLessThanOrEqual(viewport.height);
    expect(playheadBox.x + playheadBox.width).toBeLessThanOrEqual(viewport.width);
    expect(playheadBox.y + playheadBox.height).toBeLessThanOrEqual(viewport.height);
  });

  test('playtest layout keeps timeline reachable in walk mode', async ({ page }) => {
    // Must re-navigate with ?earth=0 — plain '/' sends human-scale zoom into
    // Earth globe mode instead of walk mode. Init scripts persist across goto.
    await enterWalkMode(page);

    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing viewport');

    // Walk mode collapses the timeline to a pill so the scene stays readable —
    // the pill itself must be on-screen, and expanding it must bring the full
    // timeline stack back fully inside the viewport.
    const pill = page.getByTestId('time-controls-collapsed');
    await expect(pill).toBeVisible();
    const pillBox = await pill.boundingBox();
    if (!pillBox) throw new Error('Missing collapsed timeline pill');
    expect(pillBox.y + pillBox.height).toBeLessThanOrEqual(viewport.height);

    await pill.click();

    const temporal = page.getByTestId('temporal-zoom');
    const playhead = page.getByTestId('timeline-playhead');
    await expect(temporal).toBeVisible();
    await expect(playhead).toBeVisible();

    const temporalBox = await temporal.boundingBox();
    const playheadBox = await playhead.boundingBox();
    if (!temporalBox || !playheadBox) throw new Error('Missing walk-mode timeline layout');

    expect(temporalBox.y + temporalBox.height).toBeLessThanOrEqual(viewport.height);
    expect(playheadBox.y + playheadBox.height).toBeLessThanOrEqual(viewport.height);
  });

  test('playtest panel cannot be dragged over the timeline stack', async ({ page }) => {
    const panel = page.locator('#bug-catcher-panel');
    await expect(panel).toBeVisible();

    const header = panel.locator('#bug-catcher-header');
    const headerBox = await header.boundingBox();
    if (!headerBox) throw new Error('Playtest panel header missing');

    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing viewport');

    await page.mouse.move(headerBox.x + headerBox.width / 2, headerBox.y + headerBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(viewport.width / 2, viewport.height - 20);
    await page.mouse.up();

    const panelBox = await panel.boundingBox();
    if (!panelBox) throw new Error('Playtest panel missing after drag');

    expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(viewport.height - 240);
  });

  test('playtest panel starts below Journal toggle', async ({ page }) => {
    const panel = page.locator('#bug-catcher-panel');
    await expect(panel).toBeVisible();
    const panelBox = await panel.boundingBox();
    if (!panelBox) throw new Error('Playtest panel missing');
    expect(panelBox.y).toBeGreaterThanOrEqual(80);

    const journal = page.getByTestId('journal-toggle');
    if (await journal.isVisible()) {
      const journalBox = await journal.boundingBox();
      if (journalBox) {
        expect(journalBox.y + journalBox.height).toBeLessThanOrEqual(panelBox.y + 8);
      }
    }
  });
});
