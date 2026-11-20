# Jarvis Modelo â€” JEV decide antes do cÃ©rebro responder

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="48" />
  <p><strong>Arckhé AI</strong></p>
</div>


**ðŸ‡§ðŸ‡· [PortuguÃªs](README.md) Â· ðŸ‡ºðŸ‡¸ [English](README.en.md) Â· ðŸ‡ªðŸ‡¸ [EspaÃ±ol](README.es.md)**

[Guia de uso](https://inematds.github.io/jarvismodelo/guia/) Â· [Jarvis v7 com interface](https://inematds.github.io/jarvisv7/guia/)

Base reutilizÃ¡vel para construir assistentes pessoais, de trabalho, estudo ou atendimento.
O destaque Ã© o **JEV Reflex real via OpenRouter**: cinco decisÃµes estruturadas antes do
planejamento â€” rota, completude, direcionamento, aÃ§Ã£o e cobertura das notas.
VersÃ£o **0.1.0**, Node **24**, sem dependÃªncias externas de runtime. CÃ³digo MIT.

## Rodar

```bash
git clone https://github.com/inematds/jarvismodelo.git
cd jarvismodelo
npm test
npm run demo
```

A demo Ã© determinÃ­stica e offline: recupera uma nota fictÃ­cia e prepara uma proposta de
rascunho. NÃ£o envia email, nÃ£o conecta Gmail e nÃ£o chama um LLM.

## Consultar o JEV real

Configure `OPENROUTER_API_KEY` no ambiente (sem salvar no cÃ³digo). Na instalaÃ§Ã£o INEMA,
o exemplo tambÃ©m lÃª a chave em runtime de `~/projetos/openpcbotv2/.env` ou
`~/projetos/wifi/.env`; nÃ£o copia nem imprime a credencial.

```bash
node examples/jev.ts --live
```

HÃ¡ consumo de API. O exemplo envia apenas dados fictÃ­cios, faz **uma chamada**, mostra
modelo resolvido, probabilidades, uso/custo quando informado e latÃªncia medida.
Usa `https://openrouter.ai/api/alpha/decisions` e `~typesafe/jev-latest`.
Erro, ausÃªncia de chave, contrato invÃ¡lido ou timeout de 8 s retorna `source: fallback`.
O comando termina com cÃ³digo 1 nesse caso: fallback nÃ£o comprova funcionamento do JEV.

No seu assistente, passe `reflex: { enabled: true, key: process.env.OPENROUTER_API_KEY }`
ao construtor `Assistant`. O exemplo `demo.ts` mostra os outros adaptadores.

## Adaptar para outro Jarvis

1. Implemente `retrieve(text)` com seu armazenamento; retorne atÃ© seis trechos relevantes.
2. Implemente `plan(input, decision, tools)` com o cÃ©rebro escolhido. Retorne `{answer}`
   ou `{tool, args}`; trate notas e mensagens como dados nÃ£o confiÃ¡veis.
3. Cadastre ferramentas com `name`, `route`, `effect`, `validate` e `execute`.
   `validate` deve validar argumentos em runtime e devolver uma cÃ³pia normalizada;
   nÃ£o aceite nomes de ferramentas nem efeitos fornecidos pelo usuÃ¡rio ou pelo modelo.
4. Use `ledgerPath: 'data/requests.sqlite'` com diretÃ³rio previamente criado e privado.
5. Chame `handle(requestId, input)` com ID estÃ¡vel para o mesmo pedido/retry.
6. Para `approval_required`, mostre ferramenta e argumentos ao usuÃ¡rio autenticado.
   SÃ³ o cÃ³digo confiÃ¡vel do host pode chamar `approve(approvalId)` apÃ³s sua aprovaÃ§Ã£o.
   Nunca ofereÃ§a `approve` ao modelo como ferramenta.
7. Conecte o retorno Ã  sua interface: terminal, web, voz, Telegram ou aplicativo desktop.
   Esses canais e integraÃ§Ãµes devem ser implementados por vocÃª; nÃ£o estÃ£o conectados na demo.

Exemplos de adaptaÃ§Ãµes: estudo (`retrieve` busca aulas, ferramenta de resumo), trabalho
(busca projetos e rascunhos revisÃ¡veis), casa (ferramentas com metadados e confirmaÃ§Ã£o).
Novos domÃ­nios podem ampliar `routes` em `src/reflex.ts`; mantenha `insufficient` e teste o contrato.

## Limites importantes

Probabilidades nÃ£o sÃ£o autorizaÃ§Ã£o nem taxa de acerto. As regras locais nÃ£o tÃªm
probabilidades simuladas. Candidatos no vault nÃ£o significam resposta comprovada.
Fala parcial ou nÃ£o dirigida ao assistente nÃ£o passa ao planner. Texto enviado Ã© final.
Em rota incerta, o planner recebe todas as ferramentas cadastradas; o executor ainda
valida nome, argumentos e efeito. Toda ferramenta `write` requer aprovaÃ§Ã£o no exemplo.

O ledger evita repetir o **mesmo requestId**, inclusive apÃ³s reinÃ­cio. NÃ£o detecta dois
pedidos semanticamente iguais com IDs diferentes. Tokens de aprovaÃ§Ã£o sÃ³ vivem no
processo: apÃ³s reinÃ­cio Ã© necessÃ¡rio revisar a proposta e iniciar novo pedido, depois
de confirmar que nenhum efeito ocorreu. Resultado externo incerto nÃ£o Ã© tentado novamente.
O nÃºcleo nÃ£o fornece autenticaÃ§Ã£o, servidor pÃºblico, contabilidade de orÃ§amento ou
idempotÃªncia do serviÃ§o externo; o host deve implementÃ¡-los antes de uso em produÃ§Ã£o.

Veja [arquitetura e contratos](docs/arquitetura.md) e [anÃ¡lise do vÃ­deo](docs/jev-reflex.md).

---

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="32" />
  <p><strong>Arckhé AI</strong></p>
</div>