# Jarvis Modelo — JEV decides before the brain responds

**🇧🇷 [Português](README.md) · 🇺🇸 [English](README.en.md) · 🇪🇸 [Español](README.es.md)**

[User guide](https://inematds.github.io/jarvismodelo/guia/en/) · [Jarvis v7 with interface](https://inematds.github.io/jarvisv7/guia/)

Reusable foundation for building personal, work, study, or customer service assistants.
The highlight is **real JEV Reflex via OpenRouter**: five structured decisions before
planning — route, completeness, direction, action, and note coverage.
Version **0.1.0**, Node **24**, no external runtime dependencies. MIT-licensed code.

## Run

```bash
git clone https://github.com/inematds/jarvismodelo.git
cd jarvismodelo
npm test
npm run demo
```

The demo is deterministic and offline: it retrieves a fictional note and prepares a draft
proposal. It does not send email, connect to Gmail, or call an LLM.

## Consult the real JEV

Configure `OPENROUTER_API_KEY` in the environment (do not save it in code). In the INEMA
installation, the example also reads the key at runtime from `~/projetos/openpcbotv2/.env` or
`~/projetos/wifi/.env`; it does not copy or print the credential.

```bash
node examples/jev.ts --live
```

This uses the API. The example sends only fictional data, makes **one call**, and displays
the resolved model, probabilities, usage/cost when provided, and measured latency.
It uses `https://openrouter.ai/api/alpha/decisions` and `~typesafe/jev-latest`.
An error, missing key, invalid contract, or 8 s timeout returns `source: fallback`.
In that case the command exits with code 1: fallback does not prove that JEV is working.

In your assistant, pass `reflex: { enabled: true, key: process.env.OPENROUTER_API_KEY }`
to the `Assistant` constructor. The `demo.ts` example shows the other adapters.

## Adapt for another Jarvis

1. Implement `retrieve(text)` with your storage; return up to six relevant snippets.
2. Implement `plan(input, decision, tools)` with your chosen brain. Return `{answer}`
   or `{tool, args}`; treat notes and messages as untrusted data.
3. Register tools with `name`, `route`, `effect`, `validate`, and `execute`.
   `validate` must validate arguments at runtime and return a normalized copy;
   do not accept tool names or effects supplied by the user or model.
4. Use `ledgerPath: 'data/requests.sqlite'` with a previously created, private directory.
5. Call `handle(requestId, input)` with a stable ID for the same request/retry.
6. For `approval_required`, show the tool and arguments to the authenticated user.
   Only trusted host code can call `approve(approvalId)` after their approval.
   Never offer `approve` to the model as a tool.
7. Connect the response to your interface: terminal, web, voice, Telegram, or desktop app.
   You must implement these channels and integrations; they are not connected in the demo.

Examples of adaptations: study (retrieve searches lessons, summary tool), work
(searches projects and reviewable drafts), home (tools with metadata and confirmation).
New domains can extend `routes` in `src/reflex.ts`; keep `insufficient` and test the contract.

## Important limits

Probabilities are not authorization or accuracy rates. Local rules do not have
simulated probabilities. Candidates in the vault do not mean the answer is proven.
Partial speech or speech not directed at the assistant does not reach the planner. Sent text is final.
On an uncertain route, the planner receives all registered tools; the executor still
validates the name, arguments, and effect. Every `write` tool requires approval in the example.

The ledger prevents repeating the **same requestId**, including after a restart. It does not detect two
semantically identical requests with different IDs. Approval tokens exist only in the
process: after a restart, you must review the proposal and start a new request,
after confirming that no effect occurred. An uncertain external result is not retried.
The core does not provide authentication, a public server, budget accounting, or
external service idempotency; the host must implement these before production use.

See [architecture and contracts](docs/arquitetura.md) and [video analysis](docs/jev-reflex.md).
