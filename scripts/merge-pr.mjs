#!/usr/bin/env node
/**
 * Merge a design system pull request only when its checks have passed, then confirm the site deployed.
 *
 *   npm run merge -- 37
 *   npm run merge -- 37 --check-only
 *
 * Henry, 10 Oct 2026: green design system pull requests merge without waiting for him, through this one command, the
 * way the app merges into dev (one-link's scripts/merge-pr.mjs). It refuses unless the pull request is open, not a
 * draft, has no conflicts with main, and every check on its head commit has passed, including the required
 * "build and test". It squash-merges, then waits for the "Deploy GitHub Pages" run of the merge commit on main and
 * fails unless that run succeeded, so a merge is not called done until the published site is.
 *
 * `--check-only` reports whether the pull request may merge and merges nothing. There is no flag to merge without CI.
 */
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const REPO = process.env.GH_REPO_SLUG ?? 'united-african-grain/one-link-design-system';
export const REQUIRED = ['build and test'];
export const DEPLOY_WORKFLOW = 'Deploy GitHub Pages';

/**
 * Why a pull request may not merge, or null when it may. `pr` is `gh pr view --json state,isDraft,mergeable,baseRefName`;
 * `checks` is `gh pr checks --json name,state` for its head commit.
 */
export function refusal(pr, checks, required = REQUIRED) {
  if (pr.state !== 'OPEN') return `the pull request is ${String(pr.state).toLowerCase()}, not open`;
  if (pr.isDraft) return 'the pull request is a draft';
  if (pr.baseRefName !== 'main') return `the pull request targets ${pr.baseRefName}, not main`;
  if (pr.mergeable === 'CONFLICTING') return 'the pull request has conflicts with main';
  if (pr.mergeable !== 'MERGEABLE') return `GitHub has not settled whether it can merge (${pr.mergeable}); try again shortly`;
  const missing = required.filter((name) => !checks.some((c) => c.name === name));
  if (missing.length) return `required check${missing.length > 1 ? 's' : ''} not reported: ${missing.join(', ')}`;
  const notGreen = checks.filter((c) => c.state !== 'SUCCESS' && c.state !== 'SKIPPED' && c.state !== 'NEUTRAL');
  if (notGreen.length) return `checks not green: ${notGreen.map((c) => `${c.name} (${String(c.state).toLowerCase()})`).join(', ')}`;
  return null;
}

/** The deploy run for a commit on main, from `gh run list --json`, newest first; null while none has started. */
export function deployRunFor(runs, sha, workflow = DEPLOY_WORKFLOW) {
  return runs.find((r) => r.headSha === sha && r.workflowName === workflow && r.event === 'push') ?? null;
}

const gh = (args) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const die = (msg) => { console.error(`\nREFUSED: ${msg}`); process.exit(1); };

async function main() {
  const args = process.argv.slice(2);
  const checkOnly = args.includes('--check-only');
  const number = args.find((a) => /^\d+$/.test(a));
  if (!number || args.some((a) => a.startsWith('--') && a !== '--check-only')) {
    console.error('usage: npm run merge -- <pr-number> [--check-only]');
    process.exit(2);
  }
  const pr = JSON.parse(gh(['pr', 'view', number, '--repo', REPO, '--json', 'number,title,state,isDraft,mergeable,baseRefName,headRefName,headRefOid']));
  console.log(`PR #${pr.number}  ${pr.title}\n${pr.headRefName} -> ${pr.baseRefName}  @ ${pr.headRefOid.slice(0, 8)}\n`);
  const checks = JSON.parse(gh(['pr', 'checks', number, '--repo', REPO, '--json', 'name,state']) || '[]');
  for (const c of checks) console.log(`  ${c.state.padEnd(10)} ${c.name}`);
  const why = refusal(pr, checks);
  if (why) die(why);
  if (checkOnly) { console.log('\nMay merge (check only: nothing merged).'); return; }

  gh(['pr', 'merge', number, '--repo', REPO, '--squash', '--delete-branch', '--match-head-commit', pr.headRefOid]);
  const merged = JSON.parse(gh(['pr', 'view', number, '--repo', REPO, '--json', 'state,mergeCommit']));
  if (merged.state !== 'MERGED') die(`GitHub did not merge #${number}`);
  const sha = merged.mergeCommit.oid;
  console.log(`\nMerged #${number} into main (squash) as ${sha.slice(0, 8)}. Waiting for the site to deploy.`);

  const deadline = Date.now() + 20 * 60_000;
  let run = null;
  while (Date.now() < deadline) {
    const runs = JSON.parse(gh(['run', 'list', '--repo', REPO, '--branch', 'main', '--limit', '20', '--json', 'databaseId,headSha,workflowName,event,status,conclusion']));
    run = deployRunFor(runs, sha);
    if (run && run.status === 'completed') break;
    await sleep(20_000);
  }
  if (!run) die(`no "${DEPLOY_WORKFLOW}" run started for ${sha.slice(0, 8)} within 20 minutes`);
  if (run.status !== 'completed') die(`the "${DEPLOY_WORKFLOW}" run ${run.databaseId} did not finish within 20 minutes`);
  if (run.conclusion !== 'success') die(`the site did not deploy: run ${run.databaseId} ended ${run.conclusion}`);
  console.log(`Deployed: run ${run.databaseId} succeeded. The app re-pins with npm run design-system:sync -- ${sha}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
