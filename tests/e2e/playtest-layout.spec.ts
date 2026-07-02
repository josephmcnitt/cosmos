import { test, expect } from '@playwright/test';
import { buildPanelScript } from '../../tools/bug-catcher/panelScript';
import { buildPlaytestLayoutInitScript } from '../../tools/bug-catcher/playtestLayout';
import { disableEarthGlobe, setSpiritualFullDepth, skipIntro } from './helpers';

test.describe('Playtest tool timeline visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript({ content: buildPlaytestLayoutInitScript() });
    await page.addInitScript({ content: buildPanelScript({ mode: 'guidance' }) });
    await page.goto('/?earth=0');
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

  test('playtest layout keeps timeline visible in walk mode', async ({ page }) => {
    await disableEarthGlobe(page);
    await setSpiritualFullDepth(page);
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 15_000 });

    const temporal = page.getByTestId('temporal-zoom');
    const playhead = page.getByTestId('timeline-playhead');

    await expect(temporal).toBeVisible();
    await expect(playhead).toBeVisible();

    const viewport = page.viewportSize();
    const temporalBox = await temporal.boundingBox();
    if (!viewport || !temporalBox) throw new Error('Missing walk-mode timeline layout');

    expect(temporalBox.y + temporalBox.height).toBeLessThanOrEqual(viewport.height);
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
});
