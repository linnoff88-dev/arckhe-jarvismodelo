# Jarvis Modelo — JEV decide antes de que responda el cerebro

**🇧🇷 [Português](README.md) · 🇺🇸 [English](README.en.md) · 🇪🇸 [Español](README.es.md)**

[Guía de uso](https://inematds.github.io/jarvismodelo/guia/es/) · [Jarvis v7 con interfaz](https://inematds.github.io/jarvisv7/guia/)

Base reutilizable para construir asistentes personales, de trabajo, estudio o atención.
Lo destacado es el **JEV Reflex real vía OpenRouter**: cinco decisiones estructuradas antes de la
planificación — ruta, completitud, direccionamiento, acción y cobertura de las notas.
Versión **0.1.0**, Node **24**, sin dependencias externas en tiempo de ejecución. Código MIT.

## Ejecutar

```bash
git clone https://github.com/inematds/jarvismodelo.git
cd jarvismodelo
npm test
npm run demo
```

La demo es determinista y offline: recupera una nota ficticia y prepara una propuesta de
borrador. No envía emails, no conecta con Gmail ni llama a un LLM.

## Consultar el JEV real

Configura `OPENROUTER_API_KEY` en el entorno (sin guardarla en el código). En la instalación INEMA,
el ejemplo también lee la clave en tiempo de ejecución desde `~/projetos/openpcbotv2/.env` o
`~/projetos/wifi/.env`; no copia ni imprime la credencial.

```bash
node examples/jev.ts --live
```

Hay consumo de API. El ejemplo solo envía datos ficticios, hace **una llamada**, muestra
el modelo resuelto, las probabilidades, el uso/costo cuando se informa y la latencia medida.
Usa `https://openrouter.ai/api/alpha/decisions` y `~typesafe/jev-latest`.
Un error, la falta de clave, un contrato inválido o un timeout de 8 s devuelve `source: fallback`.
El comando termina con código 1 en ese caso: el fallback no demuestra que el JEV funcione.

En tu asistente, pasa `reflex: { enabled: true, key: process.env.OPENROUTER_API_KEY }`
al constructor `Assistant`. El ejemplo `demo.ts` muestra los otros adaptadores.

## Adaptar para otro Jarvis

1. Implementa `retrieve(text)` con tu almacenamiento; devuelve hasta seis fragmentos relevantes.
2. Implementa `plan(input, decision, tools)` con el cerebro elegido. Devuelve `{answer}`
   o `{tool, args}`; trata las notas y los mensajes como datos no confiables.
3. Registra herramientas con `name`, `route`, `effect`, `validate` y `execute`.
   `validate` debe validar los argumentos en tiempo de ejecución y devolver una copia normalizada;
   no aceptes nombres de herramientas ni efectos proporcionados por el usuario o el modelo.
4. Usa `ledgerPath: 'data/requests.sqlite'` con un directorio privado creado previamente.
5. Llama a `handle(requestId, input)` con un ID estable para la misma solicitud/reintento.
6. Para `approval_required`, muestra la herramienta y los argumentos al usuario autenticado.
   Solo el código confiable del host puede llamar a `approve(approvalId)` tras su aprobación.
   Nunca ofrezcas `approve` al modelo como herramienta.
7. Conecta la respuesta con tu interfaz: terminal, web, voz, Telegram o aplicación de escritorio.
   Debes implementar estos canales e integraciones; no están conectados en la demo.

Ejemplos de adaptaciones: estudio (`retrieve` busca clases, herramienta de resumen), trabajo
(busca proyectos y borradores revisables), casa (herramientas con metadatos y confirmación).
Los nuevos dominios pueden ampliar `routes` en `src/reflex.ts`; conserva `insufficient` y prueba el contrato.

## Límites importantes

Las probabilidades no son autorización ni tasa de acierto. Las reglas locales no tienen
probabilidades simuladas. Los candidatos en el vault no significan que la respuesta esté comprobada.
El habla parcial o no dirigida al asistente no pasa al planificador. El texto enviado es definitivo.
En una ruta incierta, el planificador recibe todas las herramientas registradas; el ejecutor aún
valida el nombre, los argumentos y el efecto. Toda herramienta `write` requiere aprobación en el ejemplo.

El ledger evita repetir el **mismo requestId**, incluso después de reiniciar. No detecta dos
solicitudes semánticamente iguales con IDs diferentes. Los tokens de aprobación solo existen en el
proceso: tras reiniciar, es necesario revisar la propuesta e iniciar una nueva solicitud, después
de confirmar que no se produjo ningún efecto. Un resultado externo incierto no se vuelve a intentar.
El núcleo no proporciona autenticación, servidor público, contabilidad de presupuesto ni
idempotencia del servicio externo; el host debe implementarlas antes del uso en producción.

Consulta [arquitectura y contratos](docs/arquitetura.md) y [análisis del video](docs/jev-reflex.md).
