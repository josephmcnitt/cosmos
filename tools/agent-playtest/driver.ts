import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Browser, Page } from '@playwright/test';
import { chromium } from '@playwright/test';
import { extractHudState } from '../bug-catcher/extractHudState';
import { ARRIVE_DISTANCE, planNavStep } from './nav';
import type { ProbeState, SaveSummary, StepRecord } from './types';

const SAVE_KEY = 'cosmos-save-v1';

export interface DriverOptions {
  url: string;
  headed: boolean;
  outDir: string;
}

/** Drives the Cosmos app for autonomous (agent) playtesting. */
export class AgentDriver {
  private browser!: Browser;
  page!: Page;
  private readonly options: DriverOptions;
  private consoleErrors: string[] = [];
  private stepIndex = 0;
  readonly steps: StepRecord[] = [];

  constructor(options: DriverOptions) {
    this.options = options;
    mkdirSync(options.outDir, { recursive: true });
  }

  async launch(): Promise<void> {
    this.browser = await chromium.launch({ headless: !this.options.headed });
    this.page = await this.browser.newPage({ viewport: { width: 1440, height: 900 } });
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') this.consoleErrors.push(msg.text());
    });
    this.page.on('pageerror', (err) => {
      this.consoleErrors.push(`pageerror: ${err.message}`);
    });
  }

  async close(): Promise<void> {
    await this.browser?.close();
  }

  /** Load the app (walk flows want earth=false) and skip the intro. */
  async boot({ earth = false }: { earth?: boolean } = {}): Promise<void> {
    const url = earth ? this.options.url : `${this.options.url}/?earth=0`;
    await this.page.goto(url);
    const overlay = this.page.getByTestId('intro-overlay');
    await overlay.waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.keyboard.press('Space');
    await overlay.waitFor({ state: 'hidden', timeout: 10_000 });
    await this.page.getByTestId('heaven-phase').waitFor({ state: 'attached', timeout: 10_000 });
    await this.page.waitForTimeout(1500);
  }

  async readSave(): Promise<Record<string, unknown> | null> {
    return this.page.evaluate((key) => {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
    }, SAVE_KEY);
  }

  async patchSave(patch: Record<string, unknown>): Promise<void> {
    await this.page.evaluate(
      ({ key, data }) => {
        const raw = localStorage.getItem(key);
        const base = raw ? JSON.parse(raw) : {};
        localStorage.setItem(key, JSON.stringify({ ...base, saveVersion: 3, ...data }));
      },
      { key: SAVE_KEY, data: patch },
    );
  }

  /** Reload after patching the save, then re-skip the intro. */
  async reloadWithSave(): Promise<void> {
    await this.page.reload();
    const overlay = this.page.getByTestId('intro-overlay');
    await overlay.waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.keyboard.press('Space');
    await overlay.waitFor({ state: 'hidden', timeout: 10_000 });
    await this.page.waitForTimeout(1500);
  }

  /** Spiritual track + human scale + present era + full depth → walking HUD. */
  async enterWalkMode(): Promise<void> {
    await this.page.getByTestId('history-track-spiritual').first().click();
    const slider = this.page.getByTestId('spatial-slider');
    await slider.waitFor({ state: 'visible' });
    await slider.fill('4');
    for (const id of ['jump-to-present', 'spiritual-jump-to-present']) {
      const btn = this.page.getByTestId(id);
      if (await btn.isVisible().catch(() => false)) await btn.click();
    }
    const depthFull = this.page.getByTestId('depth-toggle-full');
    if (await depthFull.first().isVisible().catch(() => false)) {
      await depthFull.first().click();
    }
    await this.page.getByTestId('hud-walking').waitFor({ state: 'visible', timeout: 20_000 });
    await this.waitForMode('embodied');
    await this.page.waitForTimeout(500);
  }

  async waitForMode(mode: string, timeoutMs = 15_000): Promise<void> {
    await this.page.waitForFunction(
      (expected) =>
        document
          .querySelector('[data-testid="observer-state-probe"]')
          ?.getAttribute('data-mode') === expected,
      mode,
      { timeout: timeoutMs },
    );
  }

  async readProbe(): Promise<ProbeState | null> {
    const probe = this.page.getByTestId('observer-state-probe');
    if (!(await probe.count())) return null;
    const attr = async (name: string) => (await probe.getAttribute(name)) ?? '';
    return {
      mode: await attr('data-mode'),
      spatialExponent: parseFloat(await attr('data-spatial-exponent')),
      avatarX: parseFloat(await attr('data-avatar-x')),
      avatarZ: parseFloat(await attr('data-avatar-z')),
      avatarYaw: parseFloat(await attr('data-avatar-yaw')),
    };
  }

  /** Walk the avatar to a target with keyboard pulses. Returns final distance. */
  async walkTo(targetX: number, targetZ: number, timeoutMs = 45_000): Promise<number> {
    const deadline = Date.now() + timeoutMs;
    let lastDistance = Infinity;
    await this.waitForMode('embodied');
    while (Date.now() < deadline) {
      const probe = await this.readProbe();
      if (!probe || probe.mode !== 'embodied') {
        throw new Error(`walkTo requires embodied mode (got ${probe?.mode ?? 'no probe'})`);
      }
      const step = planNavStep(probe.avatarX, probe.avatarZ, probe.avatarYaw, targetX, targetZ);
      lastDistance = step.distance;
      if (step.distance <= ARRIVE_DISTANCE) return step.distance;

      if (step.turn) await this.page.keyboard.down(step.turn);
      if (step.forward) await this.page.keyboard.down('w');
      await this.page.waitForTimeout(step.forward ? 220 : 120);
      if (step.forward) await this.page.keyboard.up('w');
      if (step.turn) await this.page.keyboard.up(step.turn);
      await this.page.waitForTimeout(60);
    }
    return lastDistance;
  }

  /** Marker/entity position from the persisted world entities. */
  async findEntityPosition(entityId: string): Promise<{ x: number; z: number } | null> {
    const save = await this.readSave();
    const entities = (save?.entities as Array<Record<string, unknown>> | undefined) ?? [];
    const entity = entities.find((e) => e.id === entityId);
    const transform = entity?.transform as { x?: number; z?: number } | undefined;
    if (!transform || typeof transform.x !== 'number' || typeof transform.z !== 'number') {
      return null;
    }
    return { x: transform.x, z: transform.z };
  }

  /** Live store snapshot via the dev-only window.__cosmos bridge (null on prod builds). */
  async readStores(): Promise<Record<string, unknown> | null> {
    return this.page.evaluate(() => {
      const cosmos = (window as unknown as Record<string, any>).__cosmos;
      if (!cosmos) return null;
      const practice = cosmos.practice.getState();
      const world = cosmos.world.getState();
      return {
        activePractice: practice.activePractice,
        realmPhase: practice.realmPhase,
        practiceDepth: practice.spiritualDepth,
        sustainElapsedSec: practice.sustainElapsedSec,
        nearbyEventId: practice.nearbyEventId,
        avatarMoving: practice.avatarMoving,
        worldDepth: world.spiritualDepth,
        resonance: world.resonance,
      };
    });
  }

  async press(key: string): Promise<void> {
    await this.page.keyboard.press(key);
    await this.page.waitForTimeout(250);
  }

  async hold(key: string, ms: number): Promise<void> {
    await this.page.keyboard.down(key);
    await this.page.waitForTimeout(ms);
    await this.page.keyboard.up(key);
  }

  private async saveSummary(): Promise<SaveSummary | null> {
    const save = await this.readSave();
    if (!save) return null;
    const entities = (save.entities as Array<Record<string, unknown>> | undefined) ?? [];
    const ringRotations: Record<string, number[]> = {};
    for (const entity of entities) {
      const state = entity.state as Record<string, unknown> | undefined;
      const rotations = state?.ringRotations;
      if (Array.isArray(rotations)) {
        ringRotations[String(entity.defId ?? entity.id)] = rotations as number[];
      }
    }
    return {
      currentWorldId: save.currentWorldId as string | undefined,
      initiationStatus: save.initiationStatus as Record<string, string> | undefined,
      completedPuzzleIds: save.completedPuzzleIds as string[] | undefined,
      completedProgressNodeIds: save.completedProgressNodeIds as string[] | undefined,
      revealedMarkerIds: save.revealedMarkerIds as string[] | undefined,
      discoveredEventIds: save.discoveredEventIds as string[] | undefined,
      activePathId: save.activePathId as string | undefined,
      sessionsCompleted: save.sessionsCompleted as number | undefined,
      spiritualDepth: save.spiritualDepth as number | undefined,
      resonance: save.resonance as Record<string, number> | undefined,
      ringRotations: Object.keys(ringRotations).length ? ringRotations : undefined,
    };
  }

  /** Record a step: probe + HUD + save summary + screenshot + drained console errors. */
  async snapshot(name: string, note?: string): Promise<StepRecord> {
    this.stepIndex += 1;
    const shotName = `${String(this.stepIndex).padStart(2, '0')}-${name.replace(/[^a-z0-9-]+/gi, '-')}.png`;
    let screenshot: string | undefined;
    try {
      await this.page.screenshot({ path: join(this.options.outDir, shotName), timeout: 8000 });
      screenshot = shotName;
    } catch {
      screenshot = undefined;
    }
    const record: StepRecord = {
      index: this.stepIndex,
      name,
      note,
      at: new Date().toISOString(),
      probe: await this.readProbe().catch(() => null),
      hud: extractHudState(await this.page.content()),
      save: await this.saveSummary().catch(() => null),
      consoleErrors: this.consoleErrors.splice(0),
      screenshot,
      observations: [],
      problems: [],
    };
    this.steps.push(record);
    return record;
  }
}
