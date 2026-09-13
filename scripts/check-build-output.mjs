#!/usr/bin/env node
/**
 * Deploy guard: refuse a build output that still points at a local API.
 *
 * Why this exists
 * ---------------
 * `NEXT_PUBLIC_*` values are inlined into the JavaScript at build time, not read
 * at runtime, and Next.js gives `.env.local` (the developer machine, usually
 * http://127.0.0.1:8000) priority over `.env.production`. `deploy.sh` builds on
 * the developer machine and copies `.next/static` + `.next/standalone` to the
 * server, so a bundle built with the wrong env cannot be repaired by nginx, pm2
 * or by editing `.env.production` afterwards - the admin panel simply talks to
 * 127.0.0.1 from the visitor's browser and every request fails.
 *
 * `scripts/build.mjs` exports the right value before calling `next build`; this
 * script is the net underneath it: whatever goes wrong (a new env file, a new
 * hardcoded URL in a component, someone running `next build` by hand) the deploy
 * stops here, because `deploy.sh` runs `npm run build` with `set -e`.
 *
 * Usage
 *   node scripts/check-build-output.mjs          # scan ./.next
 *   npm run check:build-output
 *
 * Escape hatches (both print a loud warning):
 *   PETGO_ALLOW_LOCAL_API_BUILD=1   local production smoke test against a local API
 *   CI=true                          CI only compiles to prove the build works and
 *                                    never deploys its artifact (no .env* in CI, so
 *                                    src/lib/api.ts falls back to localhost)
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

/** Directories that end up on the production server (see deploy.sh steps 3). */
const SCAN_DIRS = [
    '.next/static',
    '.next/server',
    '.next/standalone/.next/server',
];

/** Source maps embed the original source, including fallback string literals
 * such as `process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'` that the
 * minifier already folded away - scanning them would only produce noise. */
const SKIPPED_SUFFIXES = ['.map'];
const SKIPPED_DIRS = new Set(['node_modules', 'cache']);

/**
 * Any URL that only resolves inside a developer machine / private network.
 * The literal `http://` / `https://` prefix is required, so neither the bare
 * word "localhost" in unrelated text nor Next.js' own server runtime - which
 * builds its origin as `${a?"https":"http"}://localhost:${PORT}` - trips the
 * guard. An inlined NEXT_PUBLIC_API_URL is always a full literal URL.
 */
const LOCAL_URL = /https?:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(?::\d+)?/g;

/** @param {string} dir @returns {string[]} */
function walk(dir) {
    /** @type {string[]} */
    const files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (SKIPPED_DIRS.has(entry.name)) continue;
            files.push(...walk(join(dir, entry.name)));
            continue;
        }
        if (!entry.isFile()) continue;
        if (SKIPPED_SUFFIXES.some((suffix) => entry.name.endsWith(suffix))) continue;
        files.push(join(dir, entry.name));
    }
    return files;
}

/**
 * @returns {{ file: string, urls: string[] }[]} one entry per offending file
 */
export function findLocalApiUrls(root = ROOT) {
    /** @type {{ file: string, urls: string[] }[]} */
    const hits = [];
    for (const relDir of SCAN_DIRS) {
        const dir = join(root, relDir);
        if (!existsSync(dir) || !statSync(dir).isDirectory()) continue;
        for (const file of walk(dir)) {
            const matches = readFileSync(file, 'utf8').match(LOCAL_URL);
            if (!matches) continue;
            hits.push({ file: relative(root, file), urls: [...new Set(matches)].sort() });
        }
    }
    return hits;
}

function main() {
    const buildDir = join(ROOT, '.next');
    if (!existsSync(buildDir)) {
        console.error('[check-build-output] .next not found - run the build first.');
        process.exit(1);
    }

    const hits = findLocalApiUrls();
    if (hits.length === 0) {
        console.log('[check-build-output] OK - no localhost/private API URL in the build output.');
        return;
    }

    const allowed = process.env.PETGO_ALLOW_LOCAL_API_BUILD === '1';
    const ci = !!process.env.CI && process.env.CI !== 'false' && process.env.CI !== '0';
    const urls = [...new Set(hits.flatMap((hit) => hit.urls))].sort();

    console.error('');
    console.error(`[check-build-output] Local API URL baked into ${hits.length} build file(s): ${urls.join(', ')}`);
    for (const hit of hits.slice(0, 10)) {
        console.error(`  - ${hit.file}: ${hit.urls.join(', ')}`);
    }
    if (hits.length > 10) console.error(`  ... and ${hits.length - 10} more file(s)`);

    if (allowed || ci) {
        console.error(
            allowed
                ? '[check-build-output] PETGO_ALLOW_LOCAL_API_BUILD=1 - continuing. This artifact must NOT be deployed.'
                : '[check-build-output] CI build - continuing. This artifact must NOT be deployed.',
        );
        return;
    }

    console.error('');
    console.error('NEXT_PUBLIC_* values are inlined at build time: deploying this output means');
    console.error('every admin browser calls the URL above and fails. Rebuild with the real API:');
    console.error('');
    console.error('    NEXT_PUBLIC_API_URL=https://api.petgo.asia npm run build');
    console.error('');
    console.error('(npm run build already reads .env.production for you - check that the file');
    console.error(' exists and that NEXT_PUBLIC_API_URL in it is the production API.)');
    console.error('To build on purpose against a local API: PETGO_ALLOW_LOCAL_API_BUILD=1 npm run build');
    console.error('');
    process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    main();
}
