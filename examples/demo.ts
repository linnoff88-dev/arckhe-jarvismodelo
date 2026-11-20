import { Assistant } from '../src/assistant.ts';
const assistant = new Assistant({
  ledgerPath: ':memory:',
  retrieve: async () => [{ id: 'brand', title: 'Marca', content: 'Tom claro e acolhedor.' }],
  tools: [{ name: 'draft', route: 'communication', effect: 'write',
    validate: args => { if (!args || typeof (args as any).body !== 'string') throw new Error('body required'); return args; },
    execute: async args => ({ draft: args, simulated: true }) }],
  plan: async (input, _decision, tools) => tools.some(t => t.name === 'draft')
    ? { tool: 'draft', args: { body: 'Não poderei comparecer amanhã.' } }
    : { answer: input.candidates?.[0]?.content ?? 'Nenhuma nota.' },
});
try {
  console.log(JSON.stringify(await assistant.handle('example-note', { text: 'Busque minhas notas' }), null, 2));
  console.log(JSON.stringify(await assistant.handle('example-draft', { text: 'Crie um email' }), null, 2));
  // Deliberately does not approve: the host must show the exact action to its user.
} finally { assistant.close(); }
