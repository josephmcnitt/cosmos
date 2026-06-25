import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildVideoBrief } from '../src/export/buildVideoBrief';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'tools', 'openmontage', 'examples');

mkdirSync(outDir, { recursive: true });

const ids: Array<{ id: string; filename: string }> = [
  { id: 'zohar', filename: 'zohar-brief.json' },
  { id: 'platonic-academy-esoteric', filename: 'platonic-academy-brief.json' },
];

for (const { id, filename } of ids) {
  const brief = buildVideoBrief(id, { duration: 60 });
  if (!brief) {
    console.error(`Failed to build brief for ${id}`);
    process.exit(1);
  }
  writeFileSync(join(outDir, filename), JSON.stringify(brief, null, 2));
  console.log(`Wrote ${filename}`);
}
