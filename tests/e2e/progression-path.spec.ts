import { test, expect } from '@playwright/test';
import { skipIntro, setSpiritualFullDepth } from './helpers';

function injectProgressSave(
  page: import('@playwright/test').Page,
  patch: Record<string, unknown>,
) {
  return page.evaluate((data) => {
    const raw = localStorage.getItem('cosmos-save-v1');
    const base = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      'cosmos-save-v1',
      JSON.stringify({
        ...base,
        saveVersion: 3,
        initiationStatus: { grove: 'completed', alexandria: 'locked', rome: 'locked', desert: 'locked' },
        ...data,
      }),
    );
  }, patch);
}

async function waitForProgressNode(page: import('@playwright/test').Page, nodeId: string) {
  await page.waitForFunction(
    (id) => {
      const raw = localStorage.getItem('cosmos-save-v1');
      if (!raw) return false;
      const data = JSON.parse(raw);
      return Array.isArray(data.completedProgressNodeIds) && data.completedProgressNodeIds.includes(id);
    },
    nodeId,
    { timeout: 20000 },
  );
}

test.describe('progression path — Hermetic fork', () => {
  test('rational path reveals rosicrucian marker state', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await injectProgressSave(page, {
      choiceHistory: [
        {
          initiationId: 'initiation-grove',
          stepIndex: 6,
          choiceId: 'hermetic-rational',
          at: Date.now(),
        },
      ],
      completedProgressNodeIds: ['grove-hermetic-intro'],
    });
    await page.reload();
    await skipIntro(page);
    await waitForProgressNode(page, 'grove-choice-rational');

    const save = await page.evaluate(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      return raw ? JSON.parse(raw) : null;
    });

    expect(save.completedProgressNodeIds).toContain('grove-choice-rational');
    expect(save.revealedMarkerIds).toContain('grove-rosicrucian');
    expect(save.pathFlags['grove-hermetic-path']).toBe('rational');
  });

  test('experiential path sets practice flag not rosicrucian marker', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await injectProgressSave(page, {
      choiceHistory: [
        {
          initiationId: 'initiation-grove',
          stepIndex: 6,
          choiceId: 'hermetic-experiential',
          at: Date.now(),
        },
      ],
      completedProgressNodeIds: ['grove-hermetic-intro'],
    });
    await page.reload();
    await skipIntro(page);
    await waitForProgressNode(page, 'grove-choice-experiential');

    const save = await page.evaluate(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      return raw ? JSON.parse(raw) : null;
    });

    expect(save.completedProgressNodeIds).toContain('grove-choice-experiential');
    expect(save.pathFlags['grove-experiential-practice']).toBe(true);
    expect(save.revealedMarkerIds ?? []).not.toContain('grove-rosicrucian');
  });

  test('path panel shows completed milestones', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await injectProgressSave(page, {
      completedProgressNodeIds: ['grove-hermetic-intro', 'grove-choice-rational'],
      activePathId: 'hermetic-rational',
      pathFlags: { 'grove-hermetic-path': 'rational' },
    });
    await page.reload();
    await skipIntro(page);
    await page.getByTestId('ui-overlay').waitFor({ state: 'visible', timeout: 15000 });

    await page.getByTestId('path-toggle').click();
    await expect(page.getByTestId('path-panel')).toBeVisible();
    await expect(page.getByTestId('progress-node-grove-hermetic-intro-completed')).toBeVisible();
    await expect(page.getByTestId('progress-node-grove-choice-rational-completed')).toBeVisible();
    await expect(page.getByTestId('path-active-id')).toContainText('hermetic rational');
  });

  test('alexandria correspondence path reveals marker and path panel state', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await injectProgressSave(page, {
      initiationStatus: { grove: 'completed', alexandria: 'completed', rome: 'locked', desert: 'locked' },
      choiceHistory: [
        {
          initiationId: 'initiation-alexandria',
          stepIndex: 5,
          choiceId: 'alexandria-correspondence',
          at: Date.now(),
        },
      ],
      completedProgressNodeIds: ['alexandria-purification-intro'],
      unlockedWorldIds: ['grove', 'alexandria'],
    });
    await page.reload();
    await skipIntro(page);
    await waitForProgressNode(page, 'alexandria-choice-correspondence');

    const save = await page.evaluate(() => {
      const raw = localStorage.getItem('cosmos-save-v1');
      return raw ? JSON.parse(raw) : null;
    });

    expect(save.completedProgressNodeIds).toContain('alexandria-choice-correspondence');
    expect(save.revealedMarkerIds).toContain('alex-hermetic');
    expect(save.pathFlags['alexandria-purification-path']).toBe('correspondence');

    await page.getByTestId('path-toggle').click();
    await expect(page.getByTestId('path-panel')).toBeVisible();
    await expect(page.getByTestId('progress-node-alexandria-choice-correspondence-completed')).toBeVisible();
    await expect(page.getByTestId('path-active-id')).toContainText('alexandria correspondence');
  });
});
