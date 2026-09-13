#!/usr/bin/env node
/**
 * `npm run build` = pick the right build-time env, run `next build`, then verify
 * the output with scripts/check-build-output.mjs.
 *
 * Why not a plain `next build`
 * ----------------------------
 * Next.js env precedence is process.env > .env.production.local > .env.local >
 * .env.production > .env, so on a developer machine `.env.local`
 * (NEXT_PUBLIC_API_URL=http://127.0.0.1:8000) *overrides* `.env.production`.
 * `NEXT_PUBLIC_*` is inlined into the JS at build time, so the bundle that
 * deploy.sh copies to admin.petgo.asia would permanently call 127.0.0.1.
 * Exporting the value from `.env.production` into the environment before the
 * build puts it back on top of the precedence list.
 *
 * Resolution order for every NEXT_PUBLIC_* key:
 *   1. already in the environment  -> kept (explicit wins, e.g.
 *      `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run build`)
 *   2. .env.production             -> exported for the build
 *   3. neither                     -> build runs without it; src/lib/api.ts
 *      falls back to http://localhost:8000 and the guard blocks the deploy.
 */

import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const require = createRequire(import.meta.url);

/**
 * Minimal `.env` reader - enough for `KEY=value`, `export KEY=value`, comments
 * and quoted values. We only care about NEXT_PUBLIC_* (the inlined ones);
 * server-side variables are read by the server at runtime from the .env file
 * deploy.sh copies next to it.
 *
 * @param {string} file
 * @returns {Record<string, string>}
 */
function readPublicEnv(file) {
    /** @type {Record<string, string>} */
    const out = {};
    if (!existsSync(file)) return out;
    for (const rawLine of readFileSync(file, 'utf8').split('\n')) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
        if (!match) continue;
        const [, key, rawValue] = match;
        if (!key.startsWith('NEXT_PUBLIC_')) continue;
        let value = rawValue.trim();
        if (
            (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
            (value.startsWith("'") && value.endsWith("'") && value.length > 1)
        ) {
            value = value.slice(1, -1);
        }
        out[key] = value;
    }
    return out;
}

function resolveNextBin() {
    try {
        const pkgPath = require.resolve('next/package.json');
        const bin = require(pkgPath).bin;
        const rel = typeof bin === 'string' ? bin : bin?.next;
        if (rel) return join(dirname(pkgPath), rel);
    } catch {
        // fall through to the .bin shim
    }
    const shim = join(ROOT, 'node_modules', '.bin', 'next');
    if (existsSync(shim)) return shim;
    console.error('[build] Cannot find the next binary - run `npm ci` first.');
    process.exit(1);
}

const env = { ...process.env };
const fromProduction = readPublicEnv(join(ROOT, '.env.production'));
const exported = [];
for (const [key, value] of Object.entries(fromProduction)) {
    if (env[key] !== undefined) continue;
    env[key] = value;
    exported.push(key);
}

if (exported.length > 0) {
    console.log(`[build] Using .env.production for: ${exported.join(', ')} (it now beats .env.local)`);
} else if (Object.keys(fromProduction).length > 0) {
    console.log('[build] NEXT_PUBLIC_* already set in the environment - .env.production not applied.');
} else {
    console.log('[build] No .env.production with NEXT_PUBLIC_* found - building with whatever the environment provides.');
}
console.log(`[build] NEXT_PUBLIC_API_URL = ${env.NEXT_PUBLIC_API_URL ?? '(unset - src/lib/api.ts will fall back to http://localhost:8000)'}`);

const nextBuild = spawnSync(process.execPath, [resolveNextBin(), 'build', ...process.argv.slice(2)], {
    cwd: ROOT,
    stdio: 'inherit',
    env,
});
if (nextBuild.status !== 0) {
    process.exit(nextBuild.status ?? 1);
}

const guard = spawnSync(process.execPath, [join(ROOT, 'scripts', 'check-build-output.mjs')], {
    cwd: ROOT,
    stdio: 'inherit',
    env,
});
process.exit(guard.status ?? 1);
