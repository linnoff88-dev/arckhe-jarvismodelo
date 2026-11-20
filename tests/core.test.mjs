import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Assistant } from '../src/assistant.ts';
import { decide } from '../src/reflex.ts';
test('voice gates skip remote classifier', async () => {
  const d = await decide({ text: 'envie email', channel: 'voice', final: false, addressed: true }, { enabled: true, fetcher: () => { throw Error('must not call'); } });
  assert.equal(d.next, 'wait'); assert.equal(d.source, 'local');
});
test('missing key and invalid response fall back without imaginary probabilities', async () => {
  const a = await decide({ text: 'oi' }, { enabled: true });
  assert.equal(a.source, 'fallback'); assert.equal(a.answers, undefined);
  const b = await decide({ text: 'oi' }, { enabled: true, key: 'test', fetcher: async () => Response.json({ model: 'fake', answers: {} }) });
  assert.equal(b.fallbackReason, 'invalid_contract');
});
test('authorization binds validated arguments; replay and restart never repeat execution', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'jarvis-template-'));
  let calls = 0;
  const config = { ledgerPath: join(dir, 'ledger.sqlite'), retrieve: async () => [],
    plan: async () => ({ tool: 'send', args: { body: 'hello' } }),
    tools: [{ name: 'send', route: 'communication', effect: 'write', validate: a => a,
      execute: async args => { assert.equal(args.body, 'hello'); calls++; return 'sent'; } }] };
  let a = new Assistant(config);
  try {
    const input = { text: 'Envie email' };
    const r = await a.handle('one', input); assert.equal(r.status, 'approval_required'); assert.equal(calls, 0);
    assert.deepEqual(await a.handle('one', input), r);
    r.args.body = 'alterado depois da proposta';
    assert.equal((await a.approve(r.approvalId)).status, 'executed');
    await assert.rejects(() => a.approve(r.approvalId));
    a.close(); a = new Assistant(config);
    assert.equal((await a.handle('one', input)).status, 'executed'); assert.equal(calls, 1);
    await assert.rejects(() => a.handle('one', { text: 'other' }));
  } finally { a.close(); rmSync(dir, { recursive: true }); }
});
test('concurrent request and uncertain side effect require review without retry', async () => {
  let calls = 0;
  const a = new Assistant({ ledgerPath: ':memory:', retrieve: async () => [],
    plan: async () => ({ tool: 'send', args: {} }),
    tools: [{ name: 'send', route: 'communication', effect: 'write', validate: a => a,
      execute: async () => { calls++; throw Error('timeout after submission'); } }] });
  try {
    const [one, two] = await Promise.all([a.handle('id', { text: 'email' }), a.handle('id', { text: 'email' })]);
    assert.equal(two.status, 'review');
    assert.equal((await a.approve(one.approvalId)).status, 'review');
    assert.equal((await a.handle('id', { text: 'email' })).status, 'review'); assert.equal(calls, 1);
  } finally { a.close(); }
});
test('unregistered tool rejected and voice does not retrieve or plan', async () => {
  let retrievals = 0;
  const a = new Assistant({ ledgerPath: ':memory:', tools: [], retrieve: async () => { retrievals++; return []; }, plan: async () => ({ tool: 'shell', args: {} }) });
  try {
    assert.equal((await a.handle('voice', { text: 'oi', channel: 'voice' })).status, 'ignore'); assert.equal(retrievals, 0);
    assert.equal((await a.handle('text', { text: 'execute shell' })).status, 'review');
  } finally { a.close(); }
});
