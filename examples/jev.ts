/** One real JEV request with fictional content. API cost applies. */
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { parseEnv } from 'node:util';
import { decide } from '../src/reflex.ts';
if (!process.argv.includes('--live')) throw new Error('Use node examples/jev.ts --live para consultar o JEV real.');
let key = process.env.OPENROUTER_API_KEY;
for (const project of ['openpcbotv2', 'wifi']) {
  if (key) break;
  try { key = parseEnv(readFileSync(join(homedir(), 'projetos', project, '.env'), 'utf8')).OPENROUTER_API_KEY; } catch {}
}
const result = await decide({ text: 'Busque minhas notas sobre a voz da marca Aurora.', candidates: [
  {id: 'brand', title: 'Marca Aurora — exemplo fictício', content: 'Tom claro e acolhedor.'},
]}, { enabled: true, key });
console.log(JSON.stringify(result, null, 2));
if (result.source !== 'jev') process.exitCode = 1;
