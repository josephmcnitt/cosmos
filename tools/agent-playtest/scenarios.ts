import type { AgentDriver } from './driver';

export type Scenario = (driver: AgentDriver) => Promise<void>;

const GROVE_COMPLETED_PATCH = {
  activeInitiation: null,
  initiationStatus: {
    grove: 'completed',
    alexandria: 'locked',
    rome: 'locked',
    desert: 'locked',
  },
};

/** Boot → skip intro → cosmic HUD present. */
async function boot(driver: AgentDriver): Promise<void> {
  await driver.boot();
  const step = await driver.snapshot('boot', 'Intro skipped, cosmic view');
  if (!step.hud?.heavenPhase) step.problems.push('No heaven-phase indicator after intro');
  if (step.probe?.mode !== 'cosmic') {
    step.observations.push(`Mode after boot: ${step.probe?.mode ?? 'unknown'}`);
  }
}

/** Enter walk mode with grove initiation done, walk to a stone, discover it with E. */
async function walkDiscover(driver: AgentDriver): Promise<void> {
  await driver.boot();
  await driver.patchSave(GROVE_COMPLETED_PATCH);
  await driver.reloadWithSave();
  await driver.enterWalkMode();
  const entered = await driver.snapshot('walk-mode', 'Entered walk mode in the Grove');
  if (!entered.hud?.walking) entered.problems.push('Walking HUD missing after walk-mode entry');

  const marker = await driver.findEntityPosition('grove-plato');
  if (!marker) {
    entered.problems.push('grove-plato marker entity not found in save');
    return;
  }
  const distance = await driver.walkTo(marker.x, marker.z);
  const arrived = await driver.snapshot('at-stone', `Walked to grove-plato (distance ${distance.toFixed(1)})`);
  if (distance > 2.5) arrived.problems.push(`Navigation stalled ${distance.toFixed(1)} units from stone`);

  await driver.press('e');
  const discovered = await driver.snapshot('discover', 'Pressed E at the Unwritten doctrines stone');
  const discoveredIds = discovered.save?.discoveredEventIds ?? [];
  if (!discoveredIds.includes('platonic-academy-esoteric')) {
    discovered.problems.push('E press did not mark platonic-academy-esoteric discovered');
  } else {
    discovered.observations.push('Stone discovered; event recorded in save');
  }
}

/** Solve the Hermetic ring puzzle purely by pressing R — proves it is winnable. */
async function ringPuzzle(driver: AgentDriver): Promise<void> {
  await driver.boot();
  await driver.patchSave(GROVE_COMPLETED_PATCH);
  await driver.reloadWithSave();
  await driver.enterWalkMode();

  const stone = await driver.findEntityPosition('grove-hermetic');
  if (!stone) {
    (await driver.snapshot('no-stone')).problems.push('grove-hermetic marker not in save');
    return;
  }
  await driver.walkTo(stone.x, stone.z);
  const before = await driver.snapshot('at-hermetic-stone', 'At the Hermetic Corpus stone');
  before.observations.push(
    `Initial rings: ${JSON.stringify(before.save?.ringRotations?.['puzzle-hermetic-rings'] ?? 'none')}`,
  );

  let solved = false;
  const seen: string[] = [];
  for (let press = 1; press <= 12; press += 1) {
    await driver.press('r');
    const save = await driver.readSave();
    const entities = (save?.entities as Array<Record<string, unknown>> | undefined) ?? [];
    const puzzle = entities.find((e) => e.defId === 'puzzle-hermetic-rings');
    const rotations = (puzzle?.state as Record<string, unknown> | undefined)?.ringRotations;
    seen.push(JSON.stringify(rotations));
    const completed = (save?.completedPuzzleIds as string[] | undefined) ?? [];
    if (completed.includes('puzzle-hermetic-rings')) {
      solved = true;
      const step = await driver.snapshot('rings-solved', `Solved after ${press} R presses`);
      step.observations.push(`Rotation trail: ${seen.join(' → ')}`);
      break;
    }
  }
  if (!solved) {
    const step = await driver.snapshot('rings-unsolved', 'Ring puzzle not solved in 12 presses');
    step.problems.push(`Ring puzzle unsolvable by cycling R. Rotation trail: ${seen.join(' → ')}`);
  }
}

/** Hold Q at a stone and confirm the realm phase shifts. */
async function practice(driver: AgentDriver): Promise<void> {
  await driver.boot();
  await driver.patchSave(GROVE_COMPLETED_PATCH);
  await driver.reloadWithSave();
  await driver.enterWalkMode();

  const stone = await driver.findEntityPosition('grove-plato');
  if (!stone) {
    (await driver.snapshot('no-stone')).problems.push('grove-plato marker not in save');
    return;
  }
  await driver.walkTo(stone.x, stone.z);
  await driver.snapshot('before-practice', 'At stone, about to hold Q');

  // Sessions run PRACTICE_DURATION_SEC (12s); releasing Q cancels the active
  // one, and holding Q chains sessions after a short cooldown. Resonance gain
  // is 0.18/session vs LIMINAL_THRESHOLD 0.2 — the realm can only shift once
  // a second session completes, so hold through two full sessions.
  await driver.page.keyboard.down('q');
  await driver.page.waitForTimeout(3000);
  const early = await driver.snapshot('early-hold', 'Holding Q, ~3s in');
  early.observations.push(`Stores: ${JSON.stringify(await driver.readStores())}`);
  await driver.page.waitForTimeout(11_000);
  const oneSession = await driver.snapshot('one-session', 'Holding Q, ~14s (first session done)');
  oneSession.observations.push(`Stores: ${JSON.stringify(await driver.readStores())}`);
  const sessionsAtOne = oneSession.save?.sessionsCompleted ?? 0;
  oneSession.observations.push(`Sessions after first hold: ${sessionsAtOne}`);
  if (sessionsAtOne < 1) {
    oneSession.problems.push('First 12s Q hold did not complete a practice session');
  }

  await driver.page.waitForTimeout(13_000);
  const twoSessions = await driver.snapshot('two-sessions', 'Holding Q, ~27s (second session done)');
  await driver.page.keyboard.up('q');

  twoSessions.observations.push(`Stores: ${JSON.stringify(await driver.readStores())}`);
  const sessions = twoSessions.save?.sessionsCompleted ?? 0;
  const liminal = parseFloat(twoSessions.hud?.cssRealmLiminal ?? '0');
  const spiritual = parseFloat(twoSessions.hud?.cssRealmSpiritual ?? '0');
  twoSessions.observations.push(
    `Sessions: ${sessions}, realm liminal=${liminal}, spiritual=${spiritual}`,
  );
  if (sessions < 2) {
    twoSessions.problems.push('Chained Q hold did not complete a second session');
  }
  if (liminal === 0 && spiritual === 0) {
    twoSessions.problems.push(
      'Realm never left material after two sessions (depth should exceed the liminal threshold)',
    );
  }
}

/** Scrub the cosmic timeline between extremes and confirm the heavens react. */
async function timeline(driver: AgentDriver): Promise<void> {
  await driver.boot();
  const track = driver.page.getByTestId('scrubber-track');
  await track.waitFor({ state: 'visible', timeout: 10_000 });
  const box = await track.boundingBox();
  if (!box) throw new Error('Scrubber track has no bounding box');

  await driver.page.mouse.click(box.x + 1, box.y + box.height / 2);
  await driver.page.waitForTimeout(1200);
  const early = await driver.snapshot('timeline-left', 'Scrubbed to the earliest era');

  await driver.page.mouse.click(box.x + box.width - 1, box.y + box.height / 2);
  await driver.page.waitForTimeout(1200);
  const late = await driver.snapshot('timeline-right', 'Scrubbed to present');

  early.observations.push(`Heaven phase early: ${early.hud?.heavenPhase}`);
  late.observations.push(`Heaven phase present: ${late.hud?.heavenPhase}`);
  if (early.hud?.heavenPhase === late.hud?.heavenPhase) {
    late.problems.push(
      `Heaven phase did not change across the timeline (${early.hud?.heavenPhase} at both ends)`,
    );
  }
}

/**
 * Capstone: with Liber VI complete, scrub the cosmic timeline back to the
 * Big Bang — the Overflow must be witnessed, sealing the Via Resonantiae.
 */
async function overflowWitness(driver: AgentDriver): Promise<void> {
  await driver.boot();
  const VIA_CHAIN = [
    'via-resonantiae-threshold',
    'via-resonantiae-myth',
    'via-resonantiae-maps',
    'via-resonantiae-liber-i',
    'via-resonantiae-liber-ii',
    'via-resonantiae-liber-iii',
    'via-resonantiae-liber-iv',
    'via-resonantiae-silent-gate',
    'via-resonantiae-liber-vi',
  ];
  await driver.patchSave({
    ...GROVE_COMPLETED_PATCH,
    completedProgressNodeIds: VIA_CHAIN,
    pathFlags: {
      'via-resonantiae-discovered': true,
      'via-resonantiae-silent-gate': true,
      'via-resonantiae-ladder': true,
    },
    activePathId: 'via-resonantiae',
  });
  await driver.reloadWithSave();

  const before = await driver.snapshot('before-scrub', 'Liber VI complete, at the present');
  if (before.save?.pathFlags) before.observations.push('Ladder flag seeded');
  const witnessedBefore = (await driver.readSave())?.pathFlags as Record<string, unknown>;
  if (witnessedBefore?.['overflow-witnessed']) {
    before.problems.push('overflow-witnessed set before scrubbing — trigger too loose');
  }

  const track = driver.page.getByTestId('scrubber-track');
  await track.waitFor({ state: 'visible', timeout: 10_000 });
  const box = await track.boundingBox();
  if (!box) throw new Error('Scrubber track has no bounding box');
  // Leftmost pixel exactly — the log timeline reaches t≈0 only at rect.left.
  await driver.page.mouse.click(box.x, box.y + box.height / 2);
  await driver.page.waitForTimeout(1500);

  const witnessing = await driver.snapshot('witnessing', 'Scrubbed to the first light');
  const probe = driver.page.getByTestId('overflow-witness-active');
  const active = (await probe.getAttribute('data-active').catch(() => null)) === 'true';
  const bannerVisible = await driver.page
    .getByTestId('overflow-witness-banner')
    .isVisible()
    .catch(() => false);
  witnessing.observations.push(`Witness indicator active=${active}, banner=${bannerVisible}`);
  if (!active) witnessing.problems.push('Overflow witness indicator not active at the Big Bang');
  if (!bannerVisible) witnessing.problems.push('Overflow banner not shown while witnessing');

  await driver.page.waitForTimeout(1000);
  const sealed = await driver.snapshot('sealed', 'After witnessing');
  const save = await driver.readSave();
  const flags = (save?.pathFlags ?? {}) as Record<string, unknown>;
  const nodes = (save?.completedProgressNodeIds ?? []) as string[];
  const journal = (save?.journal ?? []) as Array<{ title?: string }>;
  sealed.observations.push(
    `Flags: witnessed=${flags['overflow-witnessed']}, complete=${flags['via-resonantiae-complete']}`,
  );
  if (flags['overflow-witnessed'] !== true) {
    sealed.problems.push('overflow-witnessed flag not recorded');
  }
  if (!nodes.includes('via-resonantiae-overflow')) {
    sealed.problems.push('via-resonantiae-overflow node did not complete');
  }
  if (!journal.some((j) => j.title === 'Amen Resonantiae')) {
    sealed.problems.push('Amen Resonantiae journal entry missing');
  } else {
    sealed.observations.push('Path sealed: Amen Resonantiae journaled');
  }
}

/**
 * Kabbalah arc: with kabbalah resonance seeded (PaRDeS cascades), weigh the
 * letters at the Zohar stone — wrong answer must bounce, right answer must
 * open the portal — then travel to Safed.
 */
async function kabbalahGematria(driver: AgentDriver): Promise<void> {
  await driver.boot();
  await driver.patchSave({
    ...GROVE_COMPLETED_PATCH,
    resonance: { kabbalah: 0.2 },
  });
  await driver.reloadWithSave();
  await driver.enterWalkMode();

  const seeded = await driver.snapshot('seeded', 'Grove walk with kabbalah resonance');
  const nodes = (seeded.save?.completedProgressNodeIds ?? []) as string[];
  if (!nodes.includes('kabbalah-pardes')) {
    seeded.problems.push('kabbalah-pardes did not cascade from seeded resonance');
  }
  if (!(seeded.save?.revealedMarkerIds ?? []).includes('grove-pardes')) {
    seeded.problems.push('Hidden PaRDeS stone not revealed');
  }

  const stone = await driver.findEntityPosition('grove-zohar');
  if (!stone) {
    seeded.problems.push('grove-zohar marker not found');
    return;
  }
  await driver.walkTo(stone.x, stone.z);
  await driver.press('r');
  const panelOpen = await driver.page
    .getByTestId('gematria-panel')
    .isVisible()
    .catch(() => false);
  const opened = await driver.snapshot('gematria-open', 'Pressed R at the Zohar stone');
  if (!panelOpen) {
    opened.problems.push('Gematria panel did not open on R at the Zohar stone');
    return;
  }

  await driver.page.getByTestId('gematria-option-shalom').click();
  const feedbackShown = await driver.page
    .getByTestId('gematria-feedback')
    .isVisible()
    .catch(() => false);
  const wrong = await driver.snapshot('wrong-answer', 'Chose Shalom (376) — should bounce');
  if (!feedbackShown) wrong.problems.push('Wrong answer gave no feedback');
  if ((wrong.save?.completedPuzzleIds ?? []).includes('puzzle-zohar-gematria')) {
    wrong.problems.push('Wrong answer completed the puzzle');
  }

  await driver.page.getByTestId('gematria-option-ahavah').click();
  await driver.page.waitForTimeout(600);
  const revelation = await driver.page
    .getByTestId('gematria-revelation')
    .isVisible()
    .catch(() => false);
  const solved = await driver.snapshot('solved', 'Chose Ahavah (13) — One and Love make the Name');
  if (!revelation) solved.problems.push('Revelation not shown after correct answer');
  const solvedSave = await driver.readSave();
  const puzzles = (solvedSave?.completedPuzzleIds ?? []) as string[];
  const nodesAfter = (solvedSave?.completedProgressNodeIds ?? []) as string[];
  if (!puzzles.includes('puzzle-zohar-gematria')) {
    solved.problems.push('puzzle-zohar-gematria not in completedPuzzleIds');
  }
  if (!nodesAfter.includes('kabbalah-gematria-gate')) {
    solved.problems.push('kabbalah-gematria-gate node did not complete');
  }
  await driver.page.getByTestId('gematria-close').click();

  await driver.press('f');
  const linkVisible = await driver.page
    .getByTestId('link-panel')
    .isVisible()
    .catch(() => false);
  if (!linkVisible) {
    (await driver.snapshot('no-link')).problems.push('Portal link panel did not open with F');
    return;
  }
  await driver.page.getByTestId('link-travel').click();
  await driver.page.waitForTimeout(1800);
  const arrived = await driver.snapshot('safed', 'Traveled through the Zohar portal');
  const save = await driver.readSave();
  if (save?.currentWorldId !== 'safed') {
    arrived.problems.push(`Expected to arrive in safed, got ${String(save?.currentWorldId)}`);
  } else {
    arrived.observations.push('Arrived in Safed — city of the Kabbalists');
  }
}

/**
 * Regression for the silence-step soft-lock: the desert initiation's walk-to
 * flows directly into a silence step. Arrive with W held down (key auto-repeat
 * fires into the fresh step), tap another key mid-silence, and the step must
 * STILL complete once quiet — a stray keypress restarts the timer, it must
 * never permanently block.
 */
async function desertInitiation(driver: AgentDriver): Promise<void> {
  await driver.boot();
  await driver.patchSave({
    currentWorldId: 'desert',
    unlockedWorldIds: ['grove', 'desert'],
    visitedWorldIds: ['grove', 'desert'],
    completedPuzzleIds: ['puzzle-gnostic-era'],
    initiationStatus: {
      grove: 'completed',
      alexandria: 'locked',
      rome: 'locked',
      desert: 'available',
    },
    activeInitiation: null,
  });
  await driver.reloadWithSave();
  await driver.enterWalkMode();

  const actor = await driver.findEntityPosition('desert-anchorite');
  if (!actor) {
    (await driver.snapshot('no-actor')).problems.push('desert-anchorite not in save');
    return;
  }
  await driver.walkTo(actor.x, actor.z);
  await driver.press('t');
  const panelUp = await driver.page
    .getByTestId('initiation-panel')
    .isVisible()
    .catch(() => false);
  const started = await driver.snapshot('initiation-start', 'Spoke to the Anchorite');
  if (!panelUp) {
    started.problems.push('Initiation panel did not open on T');
    return;
  }

  await driver.page.getByTestId('initiation-continue').click();
  await driver.page.getByTestId('initiation-choice-inward').click();
  await driver.page.waitForTimeout(400);

  // Walk-to step: reach the cave mouth and KEEP W HELD past the transition
  // into the silence step — the historical soft-lock trigger.
  await driver.walkTo(-4, -10);
  await driver.page.keyboard.down('w');
  await driver.page.waitForTimeout(900);
  await driver.page.keyboard.up('w');
  const atCave = await driver.snapshot('at-cave', 'Arrived holding W into the silence step');

  // Tap a key mid-silence too — must restart the timer, not poison it.
  await driver.page.waitForTimeout(1500);
  await driver.press('a');
  await driver.page.waitForTimeout(7500);

  // Silence complete → the closing dialogue step appears; Continue seals it.
  const closing = driver.page.getByTestId('initiation-continue');
  if (await closing.isVisible().catch(() => false)) {
    await closing.click();
    await driver.page.waitForTimeout(400);
  }

  const done = await driver.snapshot('after-silence', 'Waited quietly ~7s after last key');
  const status = (done.save?.initiationStatus ?? {}) as Record<string, string>;
  if (status.desert !== 'completed') {
    done.problems.push(
      `Silence step never completed (initiationStatus.desert=${status.desert}) — soft-lock regression`,
    );
  } else {
    done.observations.push('Gnostic threshold crossed — silence step recovered from keypresses');
  }
  void atCave;
}

export const SCENARIOS: Record<string, Scenario> = {
  boot,
  'walk-discover': walkDiscover,
  'ring-puzzle': ringPuzzle,
  practice,
  timeline,
  'overflow-witness': overflowWitness,
  'kabbalah-gematria': kabbalahGematria,
  'desert-initiation': desertInitiation,
};
