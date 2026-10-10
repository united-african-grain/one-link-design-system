// The merge script's rules (Henry, 10 Oct 2026): a design system pull request merges only when it is open, not a
// draft, aimed at main, free of conflicts and green on every check including "build and test", and a merge counts
// only once its Pages deploy succeeded. No GitHub calls here: the rules are pure functions.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { refusal, deployRunFor, REQUIRED } from './merge-pr.mjs';

const open = { state: 'OPEN', isDraft: false, mergeable: 'MERGEABLE', baseRefName: 'main' };
const green = [{ name: 'build and test', state: 'SUCCESS' }];

describe('merge-pr: when a design system pull request may merge', () => {
  test('an open, mergeable pull request into main with every check green may merge', () => {
    assert.equal(refusal(open, green), null);
  });

  test('the required check is "build and test", the CI job name', () => {
    assert.deepEqual(REQUIRED, ['build and test']);
    assert.match(readFileSync(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8'), /name: build and test/);
  });

  test('a closed, draft, conflicting, unsettled or off-main pull request is refused', () => {
    assert.match(refusal({ ...open, state: 'MERGED' }, green), /merged, not open/);
    assert.match(refusal({ ...open, isDraft: true }, green), /draft/);
    assert.match(refusal({ ...open, mergeable: 'CONFLICTING' }, green), /conflicts/);
    assert.match(refusal({ ...open, mergeable: 'UNKNOWN' }, green), /not settled/);
    assert.match(refusal({ ...open, baseRefName: 'dev' }, green), /targets dev/);
  });

  test('a missing, failed or running check is refused, and the refusal names it', () => {
    assert.match(refusal(open, []), /not reported: build and test/);
    assert.match(refusal(open, [{ name: 'build and test', state: 'FAILURE' }]), /build and test \(failure\)/);
    assert.match(refusal(open, [{ name: 'build and test', state: 'IN_PROGRESS' }]), /in_progress/);
    assert.match(refusal(open, [...green, { name: 'another', state: 'FAILURE' }]), /another \(failure\)/);
  });

  test('a skipped or neutral extra check does not block', () => {
    assert.equal(refusal(open, [...green, { name: 'optional', state: 'SKIPPED' }]), null);
  });
});

describe('merge-pr: the deploy that confirms a merge', () => {
  const runs = [
    { headSha: 'b', workflowName: 'Deploy GitHub Pages', event: 'push', status: 'completed', conclusion: 'success' },
    { headSha: 'a', workflowName: 'CI', event: 'push', status: 'completed', conclusion: 'success' },
    { headSha: 'a', workflowName: 'Deploy GitHub Pages', event: 'workflow_dispatch', status: 'completed', conclusion: 'success' },
    { headSha: 'a', workflowName: 'Deploy GitHub Pages', event: 'push', status: 'in_progress', conclusion: '' },
  ];
  test('is the Pages run of the merge commit on a push, never another commit, workflow or a manual run', () => {
    assert.equal(deployRunFor(runs, 'a'), runs[3]);
    assert.equal(deployRunFor(runs, 'c'), null);
  });
  test('the workflow name matches pages.yml', () => {
    assert.match(readFileSync(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8'), /^name: Deploy GitHub Pages$/m);
  });
});
