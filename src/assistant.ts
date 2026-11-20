import { createHash, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { decide, type Input, type Route, type Decision } from './reflex.ts';
export type Tool = {
  name: string; route: Route; effect: 'read' | 'write';
  validate: (args: unknown) => unknown;
  execute: (args: any) => Promise<unknown>;
};
export type Plan = { tool: string; args: unknown } | { answer: string };
/** Trust boundary: host owns tool metadata, authorization and durable ledger. */
type Config = {
    tools: Tool[]; ledgerPath: string;
    retrieve: (text: string) => Promise<NonNullable<Input['candidates']>>;
    plan: (input: Input, decision: Decision, tools: { name: string; effect: string }[]) => Promise<Plan>;
    reflex?: Parameters<typeof decide>[1];
};
export class Assistant {
  private config: Config;
  private db: DatabaseSync;
  private tools: Map<string, Tool>;
  private pending = new Map<string, { requestId: string; plan: Plan; tool: Tool; args: unknown }>();
  constructor(config: Config) {
    this.config = config;
    this.tools = new Map(config.tools.map(t => [t.name, t]));
    if (this.tools.size !== config.tools.length) throw new Error('Duplicate tool name');
    this.db = new DatabaseSync(config.ledgerPath);
    this.db.exec(`CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, state TEXT NOT NULL, result TEXT)`);
  }
  close() { this.db.close(); }
  async handle(requestId: string, input: Input) {
    if (!requestId || !input.text.trim()) throw new Error('Request ID and text required');
    const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
    const old = this.db.prepare('SELECT * FROM requests WHERE id=?').get(requestId) as any;
    if (old) {
      if (old.fingerprint !== fingerprint) throw new Error('Request ID reused for different input');
      return old.result ? JSON.parse(old.result) : { status: 'review', reason: 'Execution pending or outcome unknown; reconcile before retrying.' };
    }
    this.db.prepare('INSERT INTO requests VALUES (?, ?, ?, NULL)').run(requestId, fingerprint, 'pending');
    try {
      // Early voice gates prevent retrieval and paid decisions for ambient/partial speech.
      const gate = await decide(input);
      if (gate.next !== 'answer') return this.finish(requestId, { status: gate.next, decision: gate });
      const candidates = await this.config.retrieve(input.text);
      const enriched = { ...input, candidates };
      const decision = await decide(enriched, this.config.reflex);
      const allowed = [...this.tools.values()].filter(t => decision.route === 'insufficient' || t.route === decision.route);
      const plan = await this.config.plan(enriched, decision, allowed.map(t => ({ name: t.name, effect: t.effect })));
      if ('answer' in plan) return this.finish(requestId, { status: 'answered', answer: plan.answer, decision });
      const tool = allowed.find(t => t.name === plan.tool);
      if (!tool) throw new Error('Tool unavailable for this route');
      const args = structuredClone(tool.validate(plan.args));
      if (tool.effect === 'write') {
        const approvalId = randomUUID();
        this.pending.set(approvalId, { requestId, plan, tool, args });
        return this.finish(requestId, { status: 'approval_required', approvalId, tool: tool.name, args: structuredClone(args), decision });
      }
      return this.finish(requestId, { status: 'executed', result: await tool.execute(args), decision });
    } catch {
      return this.finish(requestId, { status: 'review', reason: 'Planning or execution failed; inspect provider before retrying.' });
    }
  }
  /** Call only from an authenticated host UI after approval of these exact args.
   * Never expose approve as a model tool. Tokens expire on restart. */
  async approve(approvalId: string) {
    const pending = this.pending.get(approvalId);
    if (!pending) throw new Error('Approval unavailable or already consumed');
    this.pending.delete(approvalId); // Consume BEFORE await: concurrent calls cannot duplicate.
    this.db.prepare("UPDATE requests SET state='executing', result=NULL WHERE id=?").run(pending.requestId);
    try {
      return this.finish(pending.requestId, { status: 'executed', result: await pending.tool.execute(pending.args) });
    } catch {
      return this.finish(pending.requestId, { status: 'review', reason: 'External outcome unknown; reconcile before retrying.' });
    }
  }
  private finish(requestId: string, result: any) {
    this.db.prepare('UPDATE requests SET state=?, result=? WHERE id=?').run(result.status, JSON.stringify(result), requestId);
    return result;
  }
}
