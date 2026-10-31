#!/usr/bin/env node
/**
 * Re-point the manual Vercel alias that the branded domain depends on.
 *
 * kids-2-5.aiu-media.com is served by the Cloudflare proxy, which fetches
 * kids-games-lac.vercel.app and sends the `x-aiu-proxy` header. That alias is a
 * *manual* alias: unlike the automatic production aliases it does not follow a
 * new deployment, so without this step the branded domain keeps serving
 * whatever build was current when the alias was last set.
 *
 * Usage:
 *   node scripts/pin-brand-alias.mjs                  # newest READY production deploy
 *   node scripts/pin-brand-alias.mjs <deployment-url> # explicit deployment
 *
 * Override the CLI lookup with VERCEL_CLI (default: `pnpm dlx vercel@latest`).
 */
import { execFileSync } from 'node:child_process';

const PROJECT = 'kids-games';
const ALIAS = 'kids-games-lac.vercel.app';
const CLI = (process.env.VERCEL_CLI ?? 'pnpm dlx vercel@latest').split(' ');

function run(args) {
  return execFileSync(CLI[0], [...CLI.slice(1), ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit']
  });
}

function listProductionDeployments() {
  const out = run(['ls', PROJECT, '--environment', 'production', '--json']);
  // The CLI banner goes to stderr; keep only the JSON payload.
  const start = out.indexOf('{');
  if (start === -1) throw new Error(`Unexpected vercel ls output:\n${out}`);
  return JSON.parse(out.slice(start));
}

const explicit = process.argv[2];
let deploymentUrl = explicit;

if (!deploymentUrl) {
  const { deployments = [] } = listProductionDeployments();
  const ready = deployments
    .filter((d) => d.target === 'production' && d.state === 'READY')
    .sort((a, b) => b.createdAt - a.createdAt);
  if (!ready.length) throw new Error('No READY production deployment found.');
  deploymentUrl = ready[0].url;

  const sha = ready[0].meta?.githubCommitSha;
  const localSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log(`Latest production: ${deploymentUrl} (${sha?.slice(0, 7) ?? 'no sha'})`);
  if (sha && sha !== localSha) {
    console.warn(
      `! WARNING: newest production deployment is ${sha.slice(0, 7)} but local HEAD is ${localSha.slice(0, 7)}.`
    );
    console.warn('  The branded domain will show the deployed commit, not your working tree.');
  }
}

run(['alias', 'set', deploymentUrl, ALIAS]);
console.log(`✓ ${ALIAS} -> ${deploymentUrl}`);
