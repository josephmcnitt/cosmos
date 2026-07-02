import { test, expect } from '@playwright/test';
import { setSpiritualFullDepth, skipIntro } from './helpers';

test.describe.configure({ mode: 'serial', timeout: 90_000 });

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

async function readSave(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('cosmos-save-v1');
    return raw ? JSON.parse(raw) : null;
  });
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
    { timeout: 30_000 },
  );
}

/** Boot game, inject save patch, reload, and wait for HUD. */
async function seedSave(page: import('@playwright/test').Page, patch: Record<string, unknown> = {}) {
  await page.goto('/');
  await skipIntro(page);
  await injectProgressSave(page, patch);
  await page.reload();
  await skipIntro(page);
  await page.getByTestId('ui-overlay').waitFor({ state: 'visible', timeout: 30_000 });
}

/** Persist a completed puzzle gate in localStorage (unlock logic covered in unit tests). */
async function injectPuzzleCompleted(
  page: import('@playwright/test').Page,
  puzzleId: string,
  targetAgeId: string,
) {
  await page.evaluate(
    ({ puzzleId: pid, targetAgeId: ageId }) => {
      const raw = localStorage.getItem('cosmos-save-v1');
      if (!raw) throw new Error('Expected save blob');
      const data = JSON.parse(raw);
      data.completedPuzzleIds = [...new Set([...(data.completedPuzzleIds ?? []), pid])];
      data.unlockedWorldIds = [...new Set([...(data.unlockedWorldIds ?? ['grove']), ageId])];
      data.entities = (data.entities ?? []).map(
        (entity: { kind: string; defId?: string; state: Record<string, unknown> }) => {
          if (entity.kind === 'portal' && entity.state?.puzzleId === pid) {
            return { ...entity, state: { ...entity.state, unlocked: true } };
          }
          if (entity.kind === 'puzzle-mechanism' && entity.defId === pid) {
            return { ...entity, state: { ...entity.state, completed: true } };
          }
          return entity;
        },
      );
      localStorage.setItem('cosmos-save-v1', JSON.stringify(data));
    },
    { puzzleId, targetAgeId },
  );
}

test.describe('game tree — Hermetic intro', () => {
  test('completes grove-hermetic-intro after grove initiation', async ({ page }) => {
    await seedSave(page, {});
    await waitForProgressNode(page, 'grove-hermetic-intro');

    const save = await readSave(page);
    expect(save.completedProgressNodeIds).toContain('grove-hermetic-intro');
  });
});

test.describe('game tree — Hermetic rational path', () => {
  test('rational fork reveals rosicrucian marker and path flags', async ({ page }) => {
    await seedSave(page, {
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
    await waitForProgressNode(page, 'grove-choice-rational');

    const save = await readSave(page);
    expect(save.revealedMarkerIds).toContain('grove-rosicrucian');
    expect(save.revealedMarkerIds ?? []).not.toContain('grove-pythagorean');
    expect(save.pathFlags['grove-hermetic-path']).toBe('rational');
    expect(save.activePathId).toBe('hermetic-rational');

    await setSpiritualFullDepth(page);
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(page.getByTestId('marker-grove-rosicrucian-visible')).toBeVisible();
    await expect(page.getByTestId('marker-grove-pythagorean-visible')).toHaveCount(0);
  });

  test('path panel shows rational milestones and next ring step', async ({ page }) => {
    await seedSave(page, {
      completedProgressNodeIds: ['grove-hermetic-intro', 'grove-choice-rational'],
      activePathId: 'hermetic-rational',
      pathFlags: { 'grove-hermetic-path': 'rational' },
    });

    await page.getByTestId('path-toggle').click();
    await expect(page.getByTestId('path-panel')).toBeVisible();
    await expect(page.getByTestId('progress-node-grove-hermetic-intro-completed')).toBeVisible();
    await expect(page.getByTestId('progress-node-grove-choice-rational-completed')).toBeVisible();
    await expect(page.getByTestId('path-active-id')).toContainText('hermetic rational');
    await expect(page.getByTestId('path-next-step')).toContainText('Hermetic ring puzzle');
  });

  test('reaches convergence after rings puzzle and Alexandria visit', async ({ page }) => {
    await seedSave(page, {
      choiceHistory: [
        {
          initiationId: 'initiation-grove',
          stepIndex: 6,
          choiceId: 'hermetic-rational',
          at: Date.now(),
        },
      ],
      completedProgressNodeIds: ['grove-hermetic-intro', 'grove-choice-rational'],
      pathFlags: { 'grove-hermetic-path': 'rational' },
      completedPuzzleIds: ['puzzle-hermetic-rings'],
      visitedWorldIds: ['grove', 'alexandria'],
      unlockedWorldIds: ['grove', 'alexandria'],
    });
    await waitForProgressNode(page, 'grove-hermetic-convergence');

    const save = await readSave(page);
    expect(save.completedProgressNodeIds).toContain('grove-hermetic-rings');
    expect(save.completedProgressNodeIds).toContain('grove-hermetic-convergence');
  });
});

test.describe('game tree — Hermetic experiential path', () => {
  test('experiential fork reveals pythagorean marker without rosicrucian marker', async ({ page }) => {
    await seedSave(page, {
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
    await waitForProgressNode(page, 'grove-choice-experiential');

    const save = await readSave(page);
    expect(save.pathFlags['grove-experiential-practice']).toBe(true);
    expect(save.pathFlags['grove-hermetic-path']).toBe('experiential');
    expect(save.revealedMarkerIds).toContain('grove-pythagorean');
    expect(save.revealedMarkerIds ?? []).not.toContain('grove-rosicrucian');

    await setSpiritualFullDepth(page);
    await page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 15_000 });
    await expect(page.getByTestId('marker-grove-pythagorean-visible')).toBeVisible();
    await expect(page.getByTestId('marker-grove-rosicrucian-visible')).toHaveCount(0);
  });

  test('path panel shows experiential route and ring next step', async ({ page }) => {
    await seedSave(page, {
      completedProgressNodeIds: ['grove-hermetic-intro', 'grove-choice-experiential'],
      activePathId: 'hermetic-experiential',
      pathFlags: {
        'grove-hermetic-path': 'experiential',
        'grove-experiential-practice': true,
      },
    });

    await page.getByTestId('path-toggle').click();
    await expect(page.getByTestId('progress-node-grove-choice-experiential-completed')).toBeVisible();
    await expect(page.getByTestId('path-active-id')).toContainText('hermetic experiential');
    await expect(page.getByTestId('path-next-step')).toContainText('Hermetic ring puzzle');
  });

  test('reaches convergence after rings puzzle and Alexandria visit', async ({ page }) => {
    await seedSave(page, {
      choiceHistory: [
        {
          initiationId: 'initiation-grove',
          stepIndex: 6,
          choiceId: 'hermetic-experiential',
          at: Date.now(),
        },
      ],
      completedProgressNodeIds: ['grove-hermetic-intro', 'grove-choice-experiential'],
      pathFlags: {
        'grove-hermetic-path': 'experiential',
        'grove-experiential-practice': true,
      },
      completedPuzzleIds: ['puzzle-hermetic-rings'],
      visitedWorldIds: ['grove', 'alexandria'],
      unlockedWorldIds: ['grove', 'alexandria'],
    });
    await waitForProgressNode(page, 'grove-hermetic-convergence');

    const save = await readSave(page);
    expect(save.completedProgressNodeIds).toContain('grove-hermetic-convergence');
  });
});

test.describe('game tree — puzzle gate spokes', () => {
  test('Hermetic rings puzzle unlocks Alexandria in save', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await injectPuzzleCompleted(page, 'puzzle-hermetic-rings', 'alexandria');
    await page.reload();
    await skipIntro(page);

    const save = await readSave(page);
    expect(save.completedPuzzleIds).toContain('puzzle-hermetic-rings');
    expect(save.unlockedWorldIds).toContain('alexandria');
    const portal = save.entities?.find(
      (e: { kind: string; state: { puzzleId?: string; unlocked?: boolean } }) =>
        e.kind === 'portal' && e.state.puzzleId === 'puzzle-hermetic-rings',
    );
    expect(portal?.state.unlocked).toBe(true);
  });

  test('Plotinus stance puzzle unlocks Rome in save', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await injectPuzzleCompleted(page, 'puzzle-plotinus-stance', 'rome');
    await page.reload();
    await skipIntro(page);

    const save = await readSave(page);
    expect(save.completedPuzzleIds).toContain('puzzle-plotinus-stance');
    expect(save.unlockedWorldIds).toContain('rome');
  });

  test('Gnostic era puzzle unlocks Desert in save', async ({ page }) => {
    await page.goto('/');
    await skipIntro(page);
    await injectPuzzleCompleted(page, 'puzzle-gnostic-era', 'desert');
    await page.reload();
    await skipIntro(page);

    const save = await readSave(page);
    expect(save.completedPuzzleIds).toContain('puzzle-gnostic-era');
    expect(save.unlockedWorldIds).toContain('desert');
  });
});
