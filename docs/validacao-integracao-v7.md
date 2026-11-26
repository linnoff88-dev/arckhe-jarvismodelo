# Validaçêo 0.2.0 — 2026-09-23

## JEV real

Teste `npx tsx scripts/verify-jev.ts --live`: banco temporário, nota fictícia de marca,
turno criado pela API Fastify e finalizado com busca local como cérebro.

- Turno: `succeeded`; origem: `jev`; rota: `vault`.
- Modelo resolvido: `typesafe/jev-1.13-20260917`.
- Latência da camada: **5.632 ms**.
- Usage: 654 input tokens, 121 output tokens; cost: **US$ 0,000027468**.
- Rota vault: probabilidade 0,92, confidence 0,90. Sêo saídas do modelo, nêo acurácia.
- As cinco respostas chegaram com contrato válido e ficaram em `output.reflex`.
- Chamada diagnóstica direta: HTTP 200, 666 ms, US$ 0,000025956.

Antes disso, duas tentativas atingiram os tetos de 2,5 s e 8 s; ambas retornaram
fallback local com turno concluído. Nêo sabemos o custo das chamadas interrompidas.
Nêo sêo um benchmark nem prova de ganho de velocidade. O teto final é 8 s, sem retry.
Credenciais carregadas em runtime; nenhum segredo ou nota pessoal entrou neste relatório.

## Verificaçêo automatizada

- 19 testes Vitest: persistência, API, idempotência da mídia, contrato JEV, fallback,
  cancelamento, limites do contexto e bloqueio de captura de voz parcial.
- Build TypeScript + Vite + servidor: aprovado. Vite mantém aviso sobre chunk do mapa 3D
  maior que 500 KB, já presente na base.
- 3 testes Playwright: fluxo de memória, uso mobile e ativaçêo JEV com fallback visível.
- Inspeçêo desktop/mobile do painel; detector de UI sem achados.

O teste de API real cobre recuperaçêo, chamada JEV, registro da decisêo e resposta
local. Nêo conecta Gmail/Telegram e nêo mede performance de um cérebro externo.
