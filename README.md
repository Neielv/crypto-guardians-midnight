<div align="center">

# Crypto Guardians

**Crypto Guardians — Narrative educational game for learning Midnight / Compact through a private voting use case.**  
**Crypto Guardians — Juego educativo narrativo para aprender Midnight / Compact a través de un caso de uso de votación privada.**

![status](https://img.shields.io/badge/status-preview-4c1d95?style=for-the-badge)
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
- Generated image assets used by the current slides

### Current status

The educational flow is playable, but this is still an in-progress version intended to collect feedback.

Known gaps:
- `FinalBossPage` is still a placeholder
- `ResultsPage` is still a placeholder
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
| `/final-boss` | Placeholder |
| `/results` | Placeholder |

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

### Notes

Internal working files, credentials, private docs, and AI prompt assets are intentionally excluded from this public version.

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
- Assets de imágenes generados usados por las slides actuales

### Estado actual

El flujo educativo se puede jugar, pero esta sigue siendo una versión en progreso publicada para recoger feedback.

Brechas conocidas:
- `FinalBossPage` sigue siendo un placeholder
- `ResultsPage` sigue siendo un placeholder
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
| `/final-boss` | Placeholder |
| `/results` | Placeholder |

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

### Notas

Los archivos internos de trabajo, credenciales, documentación privada y assets de prompts de IA están excluidos intencionalmente de esta versión pública.