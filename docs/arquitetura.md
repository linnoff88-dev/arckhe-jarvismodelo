# Arquitetura

Entrada → gates do canal → recuperaçêo → JEV Reflex → planner → executor → ledger → resposta.

- `src/reflex.ts`: contrato sem dependências de framework. Cinco perguntas em uma chamada;
  Choice para rota; Noul para completo, dirigido, açêo e vault. Valida distribuiçêo,
  conjunto de perguntas, tipos, modelo e uso. Nêo guarda chaves.
- `src/assistant.ts`: portas `retrieve`, `plan` e ferramentas. O planner recebe só as
  ferramentas da rota; se insuficiente, recebe o catálogo cadastrado. Executor rejeita
  ferramenta fora desse conjunto. Metadados `effect` pertencem ao host.
- `requests` em SQLite: reserva ID antes do primeiro await, bloqueia concorrência,
  guarda resultado e impressêo do pedido. Efeito incerto exige reconciliaçêo.
- `approve`: consome token antes do await. Tokens sêo locais, nêo credenciais de usuário;
  o host deve autenticar, limitar acesso e vincular a sessêo. Nêo expor API pública sem isso.
- `examples`: mock offline e chamada JEV real separados explicitamente.

JEV nêo controla autorizaçêo. Suas probabilidades de completude e direcionamento sêo
telemetria; os gates usam metadados do canal (`final` e `addressed`). O gate de fala
nêo é detector acústico de wake word/VAD. O adaptador de voz deve produzir esses metadados.
Cobertura do vault permanece `candidate` até o cérebro fundamentar uma resposta nos trechos.

Para outro LLM/classificador, mantenha a interface `Decision` e a política de execuçêo.
Para outro armazenamento, preserve reserva atômica de requestId e resultado durável.
Nêo armazene payloads pessoais no ledger sem política de retençêo e controle de acesso.

O arquivo `src/reflex.ts` é o mesmo núcleo entregue em `jarvisv7/packages/reflex/reflex.ts`
na versêo 0.2.0. A cópia permite clonar cada projeto independentemente; compare os arquivos
antes de sincronizar melhorias. Nêo há dependência de caminhos locais ou repo vizinho.
