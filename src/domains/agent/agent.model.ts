export type AgentWitness = {
  alias: string
}

export type AgentProfile = {
  witness: AgentWitness
  createdAt: string
}

const ALIAS_PREFIXES = [
  'Sombra',
  'Eclipse',
  'Phantom',
  'Vértigo',
  'Eco',
  'Silencio',
  'Nébula',
  'Abyss',
] as const

/**
 * Genera una sugerencia de alias procedural: Prefijo-Número (1–99).
 * 8 prefijos × 99 números = 792 combinaciones posibles.
 */
export function generateAliasSuggestion(): string {
  const prefix = ALIAS_PREFIXES[Math.floor(Math.random() * ALIAS_PREFIXES.length)]
  const number = Math.floor(Math.random() * 99) + 1
  return `${prefix}-${number}`
}

/**
 * Migra un witness legacy (6 campos personales) al nuevo modelo basado en alias.
 * Extrae `nombre` como alias; si está vacío, usa "Agente-Anónimo".
 */
export function migrateLegacyAgent(legacyWitness: unknown): AgentWitness {
  if (legacyWitness && typeof legacyWitness === 'object' && 'nombre' in legacyWitness) {
    const legacy = legacyWitness as Record<string, unknown>
    const nombre = String(legacy.nombre || '').trim()
    return { alias: nombre || 'Agente-Anónimo' }
  }
  return { alias: 'Agente-Anónimo' }
}
