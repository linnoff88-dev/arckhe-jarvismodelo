ï»¿# Jarvis Modelo ê¢â¬â JEV decide antes do cêÂ©rebro responder

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="48" />
  <p><strong>Arckhé AI</strong></p>
</div>


**ê°Å¸â¡Â§ê°Å¸â¡Â· [PortuguêÂªs](README.md) êÂ· ê°Å¸â¡Âºê°Å¸â¡Â¸ [English](README.en.md) êÂ· ê°Å¸â¡Âªê°Å¸â¡Â¸ [EspaêÂ±ol](README.es.md)**

[Guia de uso](https://inematds.github.io/jarvismodelo/guia/) êÂ· [Jarvis v7 com interface](https://inematds.github.io/jarvisv7/guia/)

Base reutilizêÂ¡vel para construir assistentes pessoais, de trabalho, estudo ou atendimento.
O destaque êÂ© o **JEV Reflex real via OpenRouter**: cinco decisêÂµes estruturadas antes do
planejamento ê¢â¬â rota, completude, direcionamento, aêÂ§êÂ£o e cobertura das notas.
VersêÂ£o **0.1.0**, Node **24**, sem dependêÂªncias externas de runtime. CêÂ³digo MIT.

## Rodar

```bash
git clone https://github.com/inematds/jarvismodelo.git
cd jarvismodelo
npm test
npm run demo
```

A demo êÂ© determinêÂ­stica e offline: recupera uma nota fictêÂ­cia e prepara uma proposta de
rascunho. NêÂ£o envia email, nêÂ£o conecta Gmail e nêÂ£o chama um LLM.

## Consultar o JEV real

Configure `OPENROUTER_API_KEY` no ambiente (sem salvar no cêÂ³digo). Na instalaêÂ§êÂ£o INEMA,
o exemplo tambêÂ©m lêÂª a chave em runtime de `~/projetos/openpcbotv2/.env` ou
`~/projetos/wifi/.env`; nêÂ£o copia nem imprime a credencial.

```bash
node examples/jev.ts --live
```

HêÂ¡ consumo de API. O exemplo envia apenas dados fictêÂ­cios, faz **uma chamada**, mostra
modelo resolvido, probabilidades, uso/custo quando informado e latêÂªncia medida.
Usa `https://openrouter.ai/api/alpha/decisions` e `~typesafe/jev-latest`.
Erro, ausêÂªncia de chave, contrato invêÂ¡lido ou timeout de 8 s retorna `source: fallback`.
O comando termina com cêÂ³digo 1 nesse caso: fallback nêÂ£o comprova funcionamento do JEV.

No seu assistente, passe `reflex: { enabled: true, key: process.env.OPENROUTER_API_KEY }`
ao construtor `Assistant`. O exemplo `demo.ts` mostra os outros adaptadores.

## Adaptar para outro Jarvis

1. Implemente `retrieve(text)` com seu armazenamento; retorne atêÂ© seis trechos relevantes.
2. Implemente `plan(input, decision, tools)` com o cêÂ©rebro escolhido. Retorne `{answer}`
   ou `{tool, args}`; trate notas e mensagens como dados nêÂ£o confiêÂ¡veis.
3. Cadastre ferramentas com `name`, `route`, `effect`, `validate` e `execute`.
   `validate` deve validar argumentos em runtime e devolver uma cêÂ³pia normalizada;
   nêÂ£o aceite nomes de ferramentas nem efeitos fornecidos pelo usuêÂ¡rio ou pelo modelo.
4. Use `ledgerPath: 'data/requests.sqlite'` com diretêÂ³rio previamente criado e privado.
5. Chame `handle(requestId, input)` com ID estêÂ¡vel para o mesmo pedido/retry.
6. Para `approval_required`, mostre ferramenta e argumentos ao usuêÂ¡rio autenticado.
   SêÂ³ o cêÂ³digo confiêÂ¡vel do host pode chamar `approve(approvalId)` apêÂ³s sua aprovaêÂ§êÂ£o.
   Nunca ofereêÂ§a `approve` ao modelo como ferramenta.
7. Conecte o retorno êÂ  sua interface: terminal, web, voz, Telegram ou aplicativo desktop.
   Esses canais e integraêÂ§êÂµes devem ser implementados por vocêÂª; nêÂ£o estêÂ£o conectados na demo.

Exemplos de adaptaêÂ§êÂµes: estudo (`retrieve` busca aulas, ferramenta de resumo), trabalho
(busca projetos e rascunhos revisêÂ¡veis), casa (ferramentas com metadados e confirmaêÂ§êÂ£o).
Novos domêÂ­nios podem ampliar `routes` em `src/reflex.ts`; mantenha `insufficient` e teste o contrato.

## Limites importantes

Probabilidades nêÂ£o sêÂ£o autorizaêÂ§êÂ£o nem taxa de acerto. As regras locais nêÂ£o têÂªm
probabilidades simuladas. Candidatos no vault nêÂ£o significam resposta comprovada.
Fala parcial ou nêÂ£o dirigida ao assistente nêÂ£o passa ao planner. Texto enviado êÂ© final.
Em rota incerta, o planner recebe todas as ferramentas cadastradas; o executor ainda
valida nome, argumentos e efeito. Toda ferramenta `write` requer aprovaêÂ§êÂ£o no exemplo.

O ledger evita repetir o **mesmo requestId**, inclusive apêÂ³s reinêÂ­cio. NêÂ£o detecta dois
pedidos semanticamente iguais com IDs diferentes. Tokens de aprovaêÂ§êÂ£o sêÂ³ vivem no
processo: apêÂ³s reinêÂ­cio êÂ© necessêÂ¡rio revisar a proposta e iniciar novo pedido, depois
de confirmar que nenhum efeito ocorreu. Resultado externo incerto nêÂ£o êÂ© tentado novamente.
O nêÂºcleo nêÂ£o fornece autenticaêÂ§êÂ£o, servidor pêÂºblico, contabilidade de orêÂ§amento ou
idempotêÂªncia do serviêÂ§o externo; o host deve implementêÂ¡-los antes de uso em produêÂ§êÂ£o.

Veja [arquitetura e contratos](docs/arquitetura.md) e [anêÂ¡lise do vêÂ­deo](docs/jev-reflex.md).

---

<div align="center">
  <img src="capa/logo.svg" alt="Arckhé AI" height="32" />
  <p><strong>Arckhé AI</strong></p>
</div>