<div align="center">

# Crypto Guardians

**Crypto Guardians — Narrative educational game for learning Midnight / Compact through a private voting use case.**  
**Crypto Guardians — Juego educativo narrativo para aprender Midnight / Compact a través de un caso de uso de votación privada.**

![status](https://img.shields.io/badge/status-public%20release-4c1d95?style=for-the-badge)
![stack](https://img.shields.io/badge/stack-React%20%7C%20TypeScript%20%7C%20Vite-0f766e?style=for-the-badge)
![content](https://img.shields.io/badge/content-EN%20%7C%20ES-1d4ed8?style=for-the-badge)
![focus](https://img.shields.io/badge/focus-private%20voting-374151?style=for-the-badge)

</div>

---

## English

Crypto Guardians is a narrative educational game built with React, TypeScript, and Vite. The player acts as an agent of the Agency and learns the core ideas behind Midnight / Compact through a private voting use case: identity, public vs private data, zero-knowledge proofs, nullifiers, DUST, commitments, Merkle trees, and final system integration.

### Quick path

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the app:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

### Current scope

This version already includes:
- Landing, onboarding, briefing, dashboard, settings, and module flow
- Modules `m0` to `m7`
- Bilingual content (`es` / `en`)
- Slide-based lessons, challenges, and code labs
- Staged Final Boss integration and results summary
- Generated image assets used by the current slides

### Game syllabus

The playable path is an eight-module progression from personal data control to a complete private-voting architecture:

`identity control` → `visibility` → `verifiable registry` → `zero-knowledge proofs` → `uniqueness` → `cost` → `protected registry` → `integration`

**Playable content at a glance:** 26 lessons, 103 slides, 27 challenges, 26 code labs, and 103 support materials. Every lesson is presented through slides and followed by an interactive challenge and code lab; the support materials reinforce the lesson with source sections, excerpts, and Compact examples. The briefing and game metadata establish the Dark Miners threat and the private-voting mission.

| Stage | Modules | Progression outcome |
|---|---|---|
| Mission foundation | Briefing, `m0`–`m1` | Keep identity and sensitive civic data under user control; reveal only what is necessary. |
| Verifiable identity | `m2`–`m3` | Model citizen records and prove eligibility without exposing the underlying data. |
| Protected participation | `m4`–`m6` | Enforce one-time use, manage proof cost, and protect registries and sealed votes. |
| Final integration | `m7` | Combine eligibility, private voting, uniqueness, verifiable tallying, and DUST-aware design. |

#### `m0` — Self-Sovereign Identity

**Outcome:** Understand why an operational identity should remain under the agent's control instead of living on a central server.

- **Lesson — Your identity as an agent-citizen:** self-sovereign identity, local-first storage, central-database exposure, and the distinction between private witness data and public contract state.
- **Slides and support:** witnesses connect private off-chain data to a Compact contract; witness declarations use parentheses; the witness stays on the local machine and is implemented by the DApp's TypeScript code; sensitive witness values need explicit `disclose()` before ledger operations.
- **Practice:** classify names, secret keys, sensitive data, central databases, and exposure risk between the Witness and central servers; complete a `witness` declaration.

#### `m1` — Ledger vs Witness

**Outcome:** Apply ledger-versus-witness visibility rules and disclose only the minimum information required for verification.

- **Lesson — Configure visible data:** visible ledger state, private witness data, minimal disclosure, and privacy-preserving civic records.
- **Slides and support:** public on-chain fields use `export ledger name: Type;` without parentheses; witness values are private, opaque to circuits, and represented by hashes; `disclose()` is the explicit boundary for a witness value entering a public or verifiable context; undeclared disclosure produces `potential witness-value disclosure`.
- **Practice:** configure only the name as public while keeping identity number, birth date, and other sensitive fields private; write the matching `ledger` and `witness` declarations. The Spanish exercise uses localized fields including cédula, telephone, and address.

#### `m2` — Verifiable Identity

**Outcome:** Model, register, query, and safely operate typed citizen identities in Compact.

- **Lesson — Register a verifiable citizen identity:** `struct`, typed fields, `Map<Bytes<32>, Citizen>`, ledger registration, and `export circuit register(...)`.
- **Lesson — Operate the citizen registry:** `Map` operations `insert`, `member`, `lookup`, and `size`; membership checks before registration; querying and counting without mutation.
- **Lesson — Build and read dossiers:** named-field, positional, and mixed `struct` construction; dot-syntax field access; `default<T>` values as a safe baseline.
- **Lesson — Design safe registration circuits:** circuit purpose, exact name/parameter/return syntax, `export` for TypeScript calls versus internal helpers, and `[]`—not `Void`—for non-returning circuits.
- **Practice and support:** build the `Citizen` type and registry with a counter, select the correct declarations and operations, and complete `Map`, `member`, field-access, and `[]` code blanks. Support materials cover typed contract organization, comma rules, named fields, and the registration entry point.

#### `m3` — Zero-Knowledge Proofs

**Outcome:** Prove that a condition is true without revealing the private data behind it.

- **Lesson — Prove without revealing:** the ZK definition, separation of verification from disclosure, prover and verifier roles, and the example of proving an age over 21 without revealing a birth date.
- **Lesson — Circuits generate the proof:** Compact compilation into verifiable ZK circuits, circuits as business logic and state-transition rules, `export` for external calls, and local runtime proof generation.
- **Lesson — Explicit disclosure:** privacy by default, `disclose()` as a narrow exception, and the exact `balance = disclose(getBalance());` pattern.
- **Lesson — Harden the mission:** compiler tracking of witness data flow, indirect disclosure, the `potential witness-value disclosure` error, and tracing the value path before fixing the boundary.
- **Practice:** identify the correct ZK definition and circuit behavior, repair a disclosure boundary, and complete `validity`, `export`, `disclose`, and `disclosure` code blanks.

#### `m4` — Nullifiers

**Outcome:** Prevent double use of a voting right without revealing the participating citizen.

- **Lesson — What is a nullifier and why uniqueness matters:** nullifiers as one-time usage or exclusion marks, deterministic hash generation from a secret and event, ledger storage, and privacy-preserving uniqueness.
- **Lesson — Prevent double-spending and double-voting:** check set membership, reject a repeated nullifier, preserve identity privacy, and apply the same pattern to spent tokens.
- **Lesson — Controlled linkability with nonce:** nonce counters, `hash(secret_key + nonce)`, multiple distinct actions from one source, and intentional linkability versus independent actions without a nonce.
- **Lesson — Practical application:** private voting and airdrop eligibility, circuit validation of correct generation plus unused status, and `member`/`insert` operations on the nullifier set.
- **Practice:** process an accepted and a rejected masked vote in a local state simulation, assemble acceptance checks, and complete `hash`, `member`, `nonce`, and `insert` code blanks.

#### `m5` — Cost of Privacy

**Outcome:** Understand DUST as the computational cost of privacy and make efficiency decisions without removing the required protection.

- **Lesson — What is DUST and why it matters:** DUST as a cryptographic resource metric, its separate balance from tokens, and the cost of generating ZK proofs through hashing, elliptic-curve arithmetic, and other computation.
- **Lesson — ZK resources and proof generation costs:** CPU, memory, and time; witness-variable count, circuit constraints, and proof system as cost factors; privacy-versus-cost trade-offs; and circuit analysis for DUST estimation.
- **Lesson — Proof server architecture:** off-chain proof generation, encrypted witnesses, the user → server → proof flow, cryptographic rather than operator trust, and a decentralized network where users can choose or run a server.
- **Lesson — Privacy cost strategies:** reduce constraints, reuse computation, choose efficient hashes, aggregate or batch proofs, cache reusable proofs, and let users choose an appropriate privacy level.
- **Practice:** classify DUST factors, match encrypted witnesses with their privacy consequences, estimate cost from constraints, and complete `computational cost`, `constraints`, `witnesses`, and `batchVote` code blanks.

#### `m6` — Protected Registry

**Outcome:** Seal values and verify registry membership without publishing every registered citizen.

- **Lesson — Sealing the vote after eligibility:** cryptographic commitments, opening later, and the `hiding` and `binding` properties.
- **Lesson — Summarize the register or seal the vote:** `persistentCommit` for values hidden until authorized opening; `persistentHash` for public integrity fingerprints such as a Merkle root; opening keys and selective disclosure.
- **Lesson — Protected register with Merkle:** binary-tree construction, hashed leaves and parent nodes, compact roots, leaf-plus-sibling membership paths, root recomputation, and `O(log n)` proof size; verify the path inside a circuit.
- **Lesson — Practical electoral flow:** publish a protected-register root, prove eligibility without exposing identity, combine commitments with Merkle proofs, and verify private token balances as an additional application in the supporting material.
- **Practice:** identify `hiding`/`binding`, choose between `persistentCommit` and `persistentHash`, recognize `O(log n)`, and complete `binding`, `persistentCommit`, `log`, and `commitment` code blanks.

#### `m7` — Complete Private Voting

**Outcome:** Integrate the complete privacy-preserving voting flow and optimize it for verifiability, uniqueness, scale, and DUST cost.

- **Lesson — Integration challenge overview:** combine `witness`, `assert`, `disclose`, `nullifier`, DUST, and Merkle membership proofs for a private election with secret votes, verifiable tallying, and no double voting.
- **Lesson — Combining all concepts:** eligibility via protected-register membership, vote commitment, nullifier generation and uniqueness checks, selective tally disclosure, and DUST accounting.
- **Lesson — Final scenario design:** ledger architecture for the Merkle root, vote commitments, and nullifier set; private witnesses on the user device; proof-server generation; and one circuit verifying the complete flow.
- **Lesson — Boss battle / final challenge:** meet the stated parameters—1,000 eligible voters, 3 candidates, private votes, public tally, double-vote prevention—and minimize DUST by reducing constraints, using efficient hashes, and batching proofs.
- **Final practice:** select the private-witness, Merkle-membership, ZK-proof, and nullifier architecture; generate a nullifier, verify Merkle eligibility, and optimize the circuit for DUST.

### Current status

The educational flow is playable, including the staged Final Boss integration and results summary. This public release is ready to share and collect feedback.

### Release

The current release is **v1.0.0**. The AppShell footer exposes the running application version on authenticated and product pages.

Roadmap:
- XP / reward system is not implemented yet
- Some internal educational support content is still being refined for source fidelity

### Routes

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/onboarding` | Agent identity setup |
| `/briefing` | Story setup |
| `/dashboard` | Module selection and progress |
| `/modules/:moduleId` | Module player |
| `/settings` | Language / settings |
| `/final-boss` | Staged final privacy integration |
| `/results` | Mission results and resources |

### Stack

- React 19
- TypeScript
- Vite
- Zustand
- i18next
- Tailwind CSS
- Zod

### Project structure

| Path | Purpose |
|---|---|
| `src/content/` | Educational content in ES and EN |
| `src/pages/` | Page-level routes |
| `src/features/` | Module player, challenges, code labs |
| `src/domains/` | Learning, progression, exposure, agent models |
| `public/images/` | Slide and briefing image assets |

### Feedback wanted

This repository is being published to collect feedback on:
- Educational clarity
- Narrative coherence
- Gameplay value of the lessons/challenges
- Private voting use-case framing
- Overall product direction

---

## Español

Crypto Guardians es un juego educativo narrativo construido con React, TypeScript y Vite. La persona jugadora actúa como agente de la Agencia y aprende las ideas centrales de Midnight / Compact a través de un caso de uso de votación privada: identidad, datos públicos vs. privados, pruebas de conocimiento cero, nullifiers, DUST, commitments, árboles de Merkle e integración final del sistema.

### Inicio rápido

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Ejecuta la aplicación:
   ```bash
   npm run dev
   ```
3. Genera la build de producción:
   ```bash
   npm run build
   ```

### Alcance actual

Esta versión ya incluye:
- Landing, onboarding, briefing, dashboard, settings y flujo de módulos
- Módulos `m0` a `m7`
- Contenido bilingüe (`es` / `en`)
- Lecciones basadas en slides, challenges y code labs
- Integración final por etapas y resumen de resultados
- Assets de imágenes generados usados por las slides actuales

### Temario del juego

El recorrido jugable avanza en ocho módulos, desde el control de los datos personales hasta una arquitectura completa de votación privada:

`control de identidad` → `visibilidad` → `registro verificable` → `pruebas zero-knowledge` → `unicidad` → `costo` → `padrón protegido` → `integración`

**Contenido jugable en cifras:** 26 lecciones, 103 slides, 27 challenges, 26 code labs y 103 materiales de apoyo. Cada lección combina slides con un challenge interactivo y un code lab; los materiales de apoyo refuerzan los conceptos con secciones de referencia, extractos y ejemplos de Compact. El briefing y los metadatos del juego establecen la amenaza de los Mineros Oscuros y la misión de construir una votación privada.

| Etapa | Módulos | Resultado de progresión |
|---|---|---|
| Fundamentos de la misión | Briefing, `m0`–`m1` | Mantener la identidad y los datos cívicos sensibles bajo control de la persona usuaria y revelar solo lo necesario. |
| Identidad verificable | `m2`–`m3` | Modelar expedientes ciudadanos y demostrar elegibilidad sin exponer los datos subyacentes. |
| Participación protegida | `m4`–`m6` | Impedir usos duplicados, administrar el costo de las pruebas y proteger el padrón y los votos sellados. |
| Integración final | `m7` | Unir elegibilidad, votación privada, unicidad, conteo verificable y diseño consciente del costo DUST. |

#### `m0` — Identidad Auto-Soberana

**Resultado:** Comprender por qué la identidad operativa debe permanecer bajo el control del agente en lugar de vivir en un servidor central.

- **Lección — Tu identidad como agente:** identidad auto-soberana, enfoque local-first, exposición de bases centralizadas y diferencia entre datos privados en witness y estado público del contrato.
- **Slides y apoyo:** los witnesses conectan datos privados off-chain con un contrato Compact; sus declaraciones usan paréntesis; el witness permanece en la máquina local y su implementación corresponde al código TypeScript de la DApp; los valores sensibles de witness requieren `disclose()` antes de operaciones sobre el ledger.
- **Práctica:** clasificar nombres, claves secretas, datos sensibles, bases centrales y riesgo de exposición entre el Witness y los servidores centrales; completar una declaración `witness`.

#### `m1` — Ledger vs Witness

**Resultado:** Aplicar las reglas de visibilidad entre ledger y witness y divulgar únicamente la información mínima necesaria para verificar.

- **Lección — Decidir qué queda expuesto:** estado visible del ledger, datos privados en witness, divulgación mínima y registros cívicos que preservan la privacidad.
- **Slides y apoyo:** los campos públicos on-chain usan `export ledger nombre: Tipo;` sin paréntesis; los valores witness son privados, opacos para los circuits y se representan mediante hashes; `disclose()` es el límite explícito para que un valor witness llegue a un contexto público o verificable; una divulgación no declarada produce `potential witness-value disclosure`.
- **Práctica:** dejar solo el nombre como público y mantener privados la cédula, la fecha de nacimiento y otros campos sensibles; escribir las declaraciones correspondientes de `ledger` y `witness`. El ejercicio en español también trabaja con teléfono y dirección.

#### `m2` — Identidad verificable

**Resultado:** Modelar, registrar, consultar y operar de forma segura identidades ciudadanas tipadas en Compact.

- **Lección — Registrar una identidad verificable:** `struct`, campos tipados, `Map<Bytes<32>, Citizen>`, registro en ledger y `export circuit register(...)`.
- **Lección — Operar el registro verificable:** operaciones de `Map` (`insert`, `member`, `lookup` y `size`); comprobación de pertenencia antes del alta; consulta y conteo sin mutar el estado.
- **Lección — Construir y leer expedientes:** construcción de `struct` con campos nombrados, posicionales y mixtos; acceso con sintaxis de punto; valores `default<T>` como base segura.
- **Lección — Diseñar circuits de registro seguros:** propósito de los circuits, sintaxis exacta de nombre, parámetros y retorno, `export` para llamadas desde TypeScript frente a helpers internos, y `[]`—no `Void`—cuando no existe retorno.
- **Práctica y apoyo:** construir el tipo `Citizen` y el registro con contador, seleccionar declaraciones y operaciones correctas y completar huecos de código para `Map`, `member`, acceso a campos y `[]`. Los materiales cubren la organización tipada del contrato, las reglas de comas, los campos nombrados y el punto de entrada de registro.

#### `m3` — Pruebas Zero-Knowledge

**Resultado:** Demostrar que una condición es verdadera sin revelar los datos privados que la sustentan.

- **Lección — Probar sin revelar:** definición de ZK, separación entre verificación y divulgación, roles de prover y verifier y ejemplo de demostrar mayoría de edad sin mostrar la fecha de nacimiento.
- **Lección — Los circuits generan la prueba:** compilación de Compact a circuitos ZK verificables, circuits como lógica de negocio y reglas de cambio de estado, `export` para llamadas externas y generación local de pruebas en ejecución.
- **Lección — Divulgación explícita:** privacidad por defecto, `disclose()` como excepción acotada y patrón exacto `balance = disclose(getBalance());`.
- **Lección — Blindar la misión:** seguimiento del flujo de datos witness por el compilador, divulgación indirecta, error `potential witness-value disclosure` y rastreo de la ruta del valor antes de corregir el límite.
- **Práctica:** identificar la definición y el comportamiento correctos de las pruebas ZK y los circuits, reparar un límite de divulgación y completar los huecos `validez`, `export`, `disclose` y `disclosure`.

#### `m4` — Nullifiers

**Resultado:** Impedir que un derecho de voto se use dos veces sin revelar la identidad del ciudadano participante.

- **Lección — Qué es un nullifier y por qué importa la unicidad:** marcas de uso único o exclusión, generación determinista mediante hash de un secreto y un evento, almacenamiento en ledger y unicidad con privacidad.
- **Lección — Prevenir el doble gasto y el doble voto:** comprobar pertenencia al set, rechazar un nullifier repetido, preservar la identidad y aplicar el mismo patrón a tokens ya gastados.
- **Lección — Linkability controlada con nonce:** contadores nonce, `hash(clave_secreta + nonce)`, acciones distintas desde un mismo origen y vinculación intencional frente a acciones independientes sin nonce.
- **Lección — Aplicación práctica:** votación privada y elegibilidad para airdrops, validación en el circuit de generación correcta y estado no utilizado, y operaciones `member`/`insert` sobre el set de nullifiers.
- **Práctica:** procesar un voto enmascarado aceptado y otro rechazado en una simulación de estado local, ensamblar las comprobaciones de aceptación y completar `hash`, `member`, `nonce` e `insert`.

#### `m5` — Costo de la privacidad

**Resultado:** Entender DUST como el costo computacional de la privacidad y tomar decisiones de eficiencia sin retirar las protecciones necesarias.

- **Lección — Qué es DUST y por qué importa:** DUST como métrica de recursos criptográficos, su balance separado de los tokens y el costo de generar pruebas ZK mediante hashes, aritmética de curvas elípticas y otros cálculos.
- **Lección — Recursos ZK y costos de generación:** CPU, memoria y tiempo; cantidad de variables witness, restricciones del circuito y sistema de pruebas; equilibrio entre privacidad y costo; y análisis del circuito para estimar DUST.
- **Lección — Arquitectura de servidores de pruebas:** generación off-chain, witnesses cifrados, flujo persona usuaria → servidor → prueba, confianza basada en criptografía y red descentralizada donde se puede elegir o ejecutar un servidor.
- **Lección — Estrategias de costo:** reducir restricciones, reutilizar cómputo, elegir hashes eficientes, agregar o agrupar pruebas, reutilizar pruebas mediante caché y permitir elegir un nivel de privacidad adecuado.
- **Práctica:** clasificar factores de DUST, relacionar witnesses cifrados con sus consecuencias de privacidad, estimar costos a partir de restricciones y completar `costo computacional`, `restricciones`, `witnesses` y `batchVote`.

#### `m6` — Padrón protegido

**Resultado:** Sellar valores y verificar pertenencia al padrón sin publicar cada identidad registrada.

- **Lección — Sellar un registro sin abrirlo:** compromisos criptográficos, apertura posterior y propiedades `hiding` y `binding`.
- **Lección — Dos sellos, dos objetivos:** `persistentCommit` para valores ocultos hasta una apertura autorizada; `persistentHash` para huellas públicas de integridad como la raíz Merkle; claves de apertura y divulgación selectiva.
- **Lección — El árbol del padrón protegido:** construcción de un árbol binario, hojas y nodos padre con hashes, raíz compacta, caminos de pertenencia con hoja y hashes hermanos, recomputación de la raíz y tamaño de prueba `O(log n)`; verificación del camino dentro de un circuit.
- **Lección — Del padrón protegido al voto privado:** publicar la raíz del padrón, demostrar elegibilidad sin exponer identidad, combinar commitments con pruebas Merkle y verificar balances privados de tokens como aplicación adicional presente en los materiales de apoyo.
- **Práctica:** identificar `hiding`/`binding`, elegir entre `persistentCommit` y `persistentHash`, reconocer `O(log n)` y completar `binding`, `persistentCommit`, `log` y `commitment`.

#### `m7` — Votación privada completa

**Resultado:** Integrar el flujo completo de votación privada y optimizarlo para verificabilidad, unicidad, escala y costo DUST.

- **Lección — Panorama de la misión integrada:** unir `witness`, `assert`, `disclose`, `nullifier`, DUST y pruebas de pertenencia Merkle en una elección privada con votos secretos, conteo verificable y sin doble voto.
- **Lección — Cómo encajan las piezas:** habilitación mediante pertenencia al padrón protegido, commitment del voto, generación y comprobación de unicidad del nullifier, divulgación selectiva del conteo y contabilidad DUST.
- **Lección — Diseño del sistema completo:** arquitectura con raíz Merkle, commitments de voto y set de nullifiers en el ledger; witnesses privados en el dispositivo; generación mediante servidor de pruebas; y un circuit que verifica el flujo completo.
- **Lección — Cierre de la misión electoral:** cumplir los parámetros indicados—1.000 votantes habilitados, 3 candidatos, votos privados, conteo público y prevención del doble voto—y minimizar DUST reduciendo restricciones, usando hashes eficientes y agrupando pruebas.
- **Práctica final:** seleccionar la arquitectura de witness privado, pertenencia Merkle, prueba ZK y nullifier; generar un nullifier, verificar elegibilidad Merkle y optimizar el circuit para DUST.

### Estado actual

El flujo educativo se puede jugar, incluyendo la integración final por etapas y el resumen de resultados. Esta versión pública está lista para compartir y recoger feedback.

### Versión

La versión actual es **v1.0.0**. El footer de AppShell muestra la versión activa de la aplicación en las páginas autenticadas y de producto.

Hoja de ruta:
- El sistema de XP / recompensas todavía no está implementado
- Parte del contenido interno de apoyo educativo todavía se sigue refinando para mantener fidelidad con las fuentes

### Rutas

| Ruta | Propósito |
|---|---|
| `/` | Landing |
| `/onboarding` | Configuración de identidad del agente |
| `/briefing` | Inicio de la historia |
| `/dashboard` | Selección de módulos y progreso |
| `/modules/:moduleId` | Reproductor de módulos |
| `/settings` | Idioma / configuración |
| `/final-boss` | Integración final de privacidad por etapas |
| `/results` | Resultados de la misión y recursos |

### Stack

- React 19
- TypeScript
- Vite
- Zustand
- i18next
- Tailwind CSS
- Zod

### Estructura del proyecto

| Ruta | Propósito |
|---|---|
| `src/content/` | Contenido educativo en ES y EN |
| `src/pages/` | Rutas a nivel de página |
| `src/features/` | Reproductor de módulos, challenges y code labs |
| `src/domains/` | Modelos de aprendizaje, progresión, exposición y agente |
| `public/images/` | Assets de imágenes para slides y briefing |

### Feedback buscado

Este repositorio se publica para recoger feedback sobre:
- Claridad educativa
- Coherencia narrativa
- Valor jugable de las lecciones/challenges
- Enfoque del caso de uso de votación privada
- Dirección general del producto
