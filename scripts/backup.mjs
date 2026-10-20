/**
 * Saves a full copy of the project into ../backups/<date>_<label>/ so you can always
 * go back to a version that worked.
 *
 *   npm run backup -- "short-name-for-this-version"
 *
 * Skipped (re-creatable, and large): node_modules, dist, .expo, .git.
 * The accounts database is copied safely even while the backend is running.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const root = path.resolve(import.meta.dirname, '..');
const backupsDir = path.resolve(root, '..', 'backups');

const label =
  (process.argv.slice(2).join(' ') || 'snapshot')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'snapshot';

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
const dest = path.join(backupsDir, `${stamp}_${label}`);

if (fs.existsSync(dest)) {
  console.error(`A backup named ${path.basename(dest)} already exists. Pick another name.`);
  process.exit(1);
}

const SKIP_DIRS = new Set(['node_modules', 'dist', '.expo', '.git', 'web-build']);
const isDbFile = (p) => /\.db(-wal|-shm)?$/.test(p);

console.log(`Saving backup to ${dest} …`);
fs.cpSync(root, dest, {
  recursive: true,
  filter: (src) => !SKIP_DIRS.has(path.basename(src)) && !isDbFile(src),
});

// Database: VACUUM INTO writes a clean, consistent copy (works while the server is running).
const dbDir = path.join(root, 'server', 'data');
let dbCount = 0;
if (fs.existsSync(dbDir)) {
  for (const file of fs.readdirSync(dbDir).filter((f) => f.endsWith('.db'))) {
    const target = path.join(dest, 'server', 'data', file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const db = new DatabaseSync(path.join(dbDir, file));
    db.exec(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
    db.close();
    dbCount++;
  }
}

fs.writeFileSync(
  path.join(dest, 'BACKUP-INFO.md'),
  `# Backup: ${label}

Saved on ${now.toLocaleString('en-IN')}.

Copied: all source code, assets (logo files), README, settings${dbCount ? ' and the accounts database (server/data)' : ''}.
Not copied: node_modules, dist, .expo, .git (all re-created automatically).

## To go back to this version

See "Backups" in README.md, or in short:

1. Close the running website / backend terminals.
2. Rename the current project folder (e.g. add \`-broken\` to its name) so nothing is lost.
3. Copy this backup folder next to it and rename the copy to the project folder's name.
4. In that folder run \`npm install\` and \`npm install --prefix server\`, then start as usual.
`,
);

console.log(`Done. Backup saved as backups/${path.basename(dest)}`);
