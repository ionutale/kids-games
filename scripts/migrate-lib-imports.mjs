#!/usr/bin/env node
/**
 * Rewrite `#lib` / `$lib` imports in tests to relative paths.
 *
 * SvelteKit 3 replaced `$lib` with the `#lib` package import. Source files can
 * keep using the alias, but tests must not: they run outside the framework's
 * resolver and should not depend on it. This script rewrites every alias
 * specifier in `tests/**` to a path relative to `src/lib`.
 *
 * Usage:
 *   node scripts/migrate-lib-imports.mjs --tests          # rewrite tests
 *   node scripts/migrate-lib-imports.mjs --tests --check  # fail if any remain
 *
 * Only test files are touched; `src/**` is never modified.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TESTS_DIR = join(ROOT, 'tests');
const LIB_DIR = join(ROOT, 'src/lib');

const args = new Set(process.argv.slice(2));
const testsMode = args.has('--tests');
const checkMode = args.has('--check');

if (!testsMode) {
  console.error('Usage: node scripts/migrate-lib-imports.mjs --tests [--check]');
  process.exit(2);
}

const ALIAS_RE = /^[#$]lib(?:\/(.*))?$/;
// Static `from '…'`, dynamic `import('…')`, and bare `import '…'`.
const SPECIFIER_RE = /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"]+)\2/g;
const ALIAS_SPECIFIER_RE = /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(['"])([#$]lib(?:\/[^'"]*)?)\1/;

function testFiles(dir = TESTS_DIR, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) testFiles(path, out);
    else if (['.js', '.mjs', '.ts', '.svelte'].includes(extname(name))) out.push(path);
  }
  return out;
}

function resolveSpecifier(file, spec) {
  const match = spec.match(ALIAS_RE);
  if (!match) return null;

  let target = match[1] ? join(LIB_DIR, match[1]) : join(LIB_DIR, 'index.js');
  if (!extname(target) && existsSync(`${target}.js`)) target = `${target}.js`;

  let rel = relative(dirname(file), target).replaceAll('\\', '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

const files = testFiles();
const pending = [];
const unresolved = [];

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const rewritten = source.replace(SPECIFIER_RE, (whole, prefix, quote, spec) => {
    const rel = resolveSpecifier(file, spec);
    if (rel === null) return whole;
    if (!existsSync(join(dirname(file), rel))) {
      unresolved.push(`${relative(ROOT, file)}: ${spec} -> ${rel}`);
    }
    return `${prefix}${quote}${rel}${quote}`;
  });

  if (rewritten !== source) pending.push({ file, rewritten });
}

if (checkMode) {
  const stale = files.filter((file) => ALIAS_SPECIFIER_RE.test(readFileSync(file, 'utf8')));
  if (stale.length) {
    console.error(`\n✗ ${stale.length} test file(s) still use a lib alias:`);
    for (const file of stale) console.error(`  ${relative(ROOT, file)}`);
    process.exit(1);
  }
  console.log(`✓ No #lib/$lib specifiers in ${files.length} test files.`);
  process.exit(0);
}

for (const { file, rewritten } of pending) writeFileSync(file, rewritten);

if (unresolved.length) {
  console.warn('! Specifiers whose target does not exist:');
  for (const line of unresolved) console.warn(`  ${line}`);
}

console.log(
  `✓ Rewrote ${pending.length} of ${files.length} test file(s) to relative #lib paths.`
);
