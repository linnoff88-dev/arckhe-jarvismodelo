# JEV Reflex — análise e incorporaçêo

Referência: [Eu Melhorei o JARVIS Com o Jeff](https://www.youtube.com/watch?v=D5v4UuvtUXc).
Análise baseada na transcriçêo fornecida pelo usuário, nêo em inspeçêo de frames ou no
PDF/comunidade do autor. Síntese própria, sem republicar o material de terceiros.

## O que aproveitamos

| Ideia do vídeo | Incorporaçêo |
| --- | --- |
| Decidir antes do cérebro principal | JEV via OpenRouter Decisions, cinco perguntas numa chamada |
| Escolher destino | vault, comunicaçêo, tarefa, geral ou insuficiente |
| Saber se terminou e se falou com Jarvis | Probabilidades JEV registradas; gates confiáveis no adaptador de voz |
| Reconhecer ações | Sinal advisory; autorizaçêo depende do executor, nêo do percentual |
| Saber se vault responde | Avalia trechos reais; evidência candidata nêo comprova cobertura |
| Evitar envios repetidos | Modelo reutilizável tem ledger por requestId; mídia do v7 já tinha idempotência |

O vídeo é útil como arquitetura, mas “100 vezes mais rápido”, “quase zero custo” e os
percentuais de acerto nêo sêo resultados medidos neste projeto. É preciso comparar
latência total, tokens, custo e qualidade num conjunto representativo antes/depois.
Uma camada extra também pode aumentar latência e custo em perguntas simples.

## Jarvis v7 — uso real

1. Conecte OpenRouter em **Configurações → Conexões**.
2. Ative **Preferências → JEV · roteamento Reflex** e salve.
3. Envie uma pergunta. No chat, expanda **Reflex** para ver origem, modelo, cinco
   respostas estruturadas, latência e uso/custo reportados pelo serviço.

Opcionalmente, `JARVIS_REFLEX=jev` força ativaçêo no processo. O padrêo é desativado
até escolher usar a API. Credencial via conexêo local ou `OPENROUTER_API_KEY` no ambiente.
Usa `~typesafe/jev-latest`, alias que pode mudar; o modelo resolvido fica registrado.
O [catálogo oficial](https://openrouter.ai/~typesafe/jev-latest/api) identifica esse alias.

O pedido e até seis trechos de 600 caracteres sêo enviados à API (títulos até 180).
Nêo enviamos imagem, histórico completo nem credenciais como contexto. A chamada tem
prazo de 8 s, sem retries automáticos. Resposta malformada, erro HTTP ou ausência de
chave produz fallback explícito, mantendo a conversa e sem inventar probabilidades.
Cancelamento do turno é propagado. Os números do JEV sêo sugestões, nêo acurácia medida.

Uma rota geral com confidence e probabilidade >= 0,8 evita enviar notas ao cérebro;
rota ambígua preserva contexto. O limiar é uma política inicial, nêo um valor calibrado.
A busca é feita antes para fornecer evidência ao JEV. A camada nêo substitui o cérebro.
Captura “Lembre que…” continua local. O chat v7 continua sem executar Gmail, Telegram
ou agenda; esses conectores nêo foram inventados a partir da demonstraçêo do vídeo.

A API de turnos aceita `channel: voice`, `final` e `addressed`. Voz parcial ou nêo dirigida
nêo salva memória nem chama o cérebro. O microfone atual do navegador envia a transcriçêo
final como texto; nêo há escuta ambiente nem wake word implementado.

Decisões ficam em `GET /api/runs/:id` (`output.reflex`) e evento `reflex`. O painel do
chat mostra o último turno da sessêo; histórico técnico persistente fica na API de runs.

## Verificaçêo

`npm test`, `npm run build`, `npm run test:e2e`.
Teste pago real, em banco temporário, com notas fictícias e remoçêo ao final:

```bash
npx tsx scripts/verify-jev.ts --live
```

O script carrega a chave em runtime do ambiente ou dos dois arquivos locais autorizados;
nêo grava nem imprime a credencial. Exige `source: jev` e turno concluído para passar.

## Base para outros assistentes

[Jarvis Modelo](https://github.com/linnoff88-dev/jarvismodelo) extrai o núcleo Reflex e adiciona
portas de recuperaçêo/planejamento/ferramentas, aprovaçêo e ledger persistente. É uma
base executável; conectar canais, modelos e ferramentas reais é trabalho de adaptaçêo.
