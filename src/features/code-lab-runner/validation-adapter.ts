import type { CodeLabDefinition } from './code-lab.types'

export type ValidationResult =
  | { status: 'success' }
  | { status: 'failure'; reason?: 'ledgerParentheses' }
  | { status: 'unavailable' }

export type ValidationRequest = { codeLab: CodeLabDefinition; sourceCode: string }

export type ValidationAdapter = {
  validate: (request: ValidationRequest) => Promise<ValidationResult>
}


const DEFAULT_VALIDATION_API_URL = 'https://api.midnight.crypto-guardians.com'
const VALIDATION_TIMEOUT_MS = 110_000

type BackendValidationResponse = {
  status?: 'success' | 'failure'
}

function getValidationApiUrl(): string {
  return (import.meta.env.VITE_VALIDATION_API_URL ?? DEFAULT_VALIDATION_API_URL).replace(/\/$/, '')
}

const backendValidationAdapter: ValidationAdapter = {
  validate: async ({ sourceCode }) => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), VALIDATION_TIMEOUT_MS)

    try {
      const response = await fetch(`${getValidationApiUrl()}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode }),
        signal: controller.signal,
      })

      const body = await response.json() as BackendValidationResponse
      if (body.status === 'success') return { status: 'success' }
      if (body.status === 'failure') return { status: 'failure' }
      return { status: 'unavailable' }
    } catch {
      return { status: 'unavailable' }
    } finally {
      window.clearTimeout(timeout)
    }
  },
}

export function createValidationAdapter(backendAdapter?: ValidationAdapter): ValidationAdapter {
  return backendAdapter ?? backendValidationAdapter
}
