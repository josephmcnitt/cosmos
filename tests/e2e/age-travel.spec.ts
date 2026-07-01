import { test, expect } from '@playwright/test';
import { enterWalkMode, setSpiritualFullDepth, skipIntro } from './helpers';

test.describe('Initiation', () => {
  test('no stone prompt before grove initiation', async ({ page }) => {
    await enterWalkMode(page);
    await expect(page.getByTestId('embodied-initiation-hint')).toBeVisible();
    await expect(page.getByTestId('embodied-discover')).toHaveCount(0);
  });

  test('stones available after initiation completes', async ({ page }) => {
    await enterWalkMode(page);

    await page.evaluate(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      if (!raw) throw new Error('Expected save blob');
      const data = JSON.parse(raw);
      data.activeInitiation = null;
      data.initiationStatus = {
        ...(data.initiationStatus ?? {}),
        grove: 'completed',
      };
      localStorage.setItem('cosmos-save-v1', JSON.stringify(data));
    });

    await page.reload();
    await skipIntro(page);
    await setSpiritualFullDepth(page);
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 20000 });
    await expect(page.getByTestId('embodied-initiation-hint')).toHaveCount(0, { timeout: 15_000 });
  });
});

test.describe('Age travel', () => {
  test('embodied age label shows Plato Grove', async ({ page }) => {
    await enterWalkMode(page);
    await expect(page.getByTestId('embodied-age-label')).toContainText("Plato's Grove");
  });

  test('stale save in another age returns to Grove before initiation', async ({ page }) => {
    await page.goto('/?earth=0');
    await skipIntro(page);

    await page.evaluate(() => {
      localStorage.setItem(
        'cosmos-save-v1',
        JSON.stringify({
          saveVersion: 3,
          savedAt: Date.now(),
          currentWorldId: 'rome',
          unlockedWorldIds: ['grove', 'rome'],
          visitedWorldIds: ['grove', 'rome'],
          worldLayers: { grove: 'material', rome: 'material' },
          discoveredEventIds: [],
          resonance: {},
          sessionsCompleted: 0,
          entities: [],
          completedPuzzleIds: [],
          puzzleState: {},
          simInstances: [],
          entanglements: [],
          journal: [],
          eraWitnessFlags: [],
          lastSimTickMs: Date.now(),
          initiationStatus: {
            grove: 'available',
            alexandria: 'locked',
            rome: 'available',
            desert: 'locked',
          },
          activeInitiation: null,
          choiceHistory: [],
          completedProgressNodeIds: [],
          pathFlags: {},
          revealedMarkerIds: [],
        }),
      );
    });

    await page.reload();
    await skipIntro(page);
    await setSpiritualFullDepth(page);
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 15000 });
    await expect(page.getByTestId('embodied-age-label')).toContainText("Plato's Grove");
  });

  test('journal toggle opens panel', async ({ page }) => {
    await enterWalkMode(page);
    await page.evaluate(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      const base = raw ? JSON.parse(raw) : {};
      localStorage.setItem(
        'cosmos-save-v1',
        JSON.stringify({
          ...base,
          initiationStatus: {
            grove: 'completed',
            alexandria: 'locked',
            rome: 'locked',
            desert: 'locked',
          },
        }),
      );
    });
    await page.reload();
    await skipIntro(page);
    await setSpiritualFullDepth(page);
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 15_000 });
    await page.getByTestId('journal-toggle').click({ force: true });
    await expect(page.getByTestId('journal-panel')).toBeVisible();
  });
});

test.describe('Persistence', () => {
  test('discovered stone persists after reload', async ({ page }) => {
    await enterWalkMode(page);

    await page.evaluate(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      if (!raw) throw new Error('Expected save blob after walk mode');
      const data = JSON.parse(raw);
      data.saveVersion = 3;
      data.discoveredEventIds = [...new Set([...(data.discoveredEventIds ?? []), 'hermetic-corpus'])];
      data.initiationStatus = { ...(data.initiationStatus ?? {}), grove: 'completed' };
      localStorage.setItem('cosmos-save-v1', JSON.stringify(data));
    });

    await page.reload();
    await skipIntro(page);
    await page.waitForFunction(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      if (!raw) return false;
      const data = JSON.parse(raw);
      return data.discoveredEventIds?.includes('hermetic-corpus');
    });

    await page.getByTestId('journal-toggle').click({ force: true });
    await expect(page.getByTestId('journal-panel')).toContainText('Hermetic Corpus');
  });
});
