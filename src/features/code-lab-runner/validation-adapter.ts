import type { CodeLabDefinition } from './code-lab.types'

export type ValidationMode = 'local' | 'backend'

export type ValidationResult =
  | { status: 'success' }
  | { status: 'failure'; reason?: 'ledgerParentheses' }
  | { status: 'unavailable' }

export type ValidationRequest = { codeLab: CodeLabDefinition; sourceCode: string }

export type ValidationAdapter = {
  mode: ValidationMode
  validate: (request: ValidationRequest) => Promise<ValidationResult>
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

export function shouldNormalizeFillInTheBlankWhitespace(codeLab: CodeLabDefinition): boolean {
  return Boolean(codeLab.workspace || codeLab.validation?.normalizeWhitespace)
}

function validateLocally({ codeLab, sourceCode }: ValidationRequest): ValidationResult {
  if (codeLab.type === 'fill_in_the_blank') {
    const expected = codeLab.payload.blanks[0]?.answer ?? ''
    const expectedSource = codeLab.payload.template.replace('___', expected)
    const matches = shouldNormalizeFillInTheBlankWhitespace(codeLab)
      ? normalizeWhitespace(sourceCode) === normalizeWhitespace(expectedSource)
      : sourceCode.trim() === expectedSource.trim()
    return matches ? { status: 'success' } : { status: 'failure' }
  }

  if (codeLab.type === 'toggle_visibility') {
    const values = Object.fromEntries(codeLab.payload.fields.map((field) => {
      const fieldType = escapeRegExp(field.dataType)
      const ledgerMatch = sourceCode.match(new RegExp(`export\\s+ledger\\s+${field.id}\\s*:\\s*${fieldType}\\s*;`, 'i'))
      return [field.id, ledgerMatch ? 'ledger' : 'witness']
    })) as Record<string, 'ledger' | 'witness'>

    const hasLedgerParenthesesError = codeLab.payload.fields.some((field) => {
      const fieldType = escapeRegExp(field.dataType)
      return sourceCode.match(new RegExp(`export\\s+ledger\\s+${field.id}\\s*\\(\\)\\s*:\\s*${fieldType}\\s*;`, 'i'))
    })
    if (hasLedgerParenthesesError) return { status: 'failure', reason: 'ledgerParentheses' }

    return codeLab.payload.fields.every((field) => values[field.id] === field.expectedScope)
      ? { status: 'success' }
      : { status: 'failure' }
  }

  return { status: 'failure' }
}

export const localValidationAdapter: ValidationAdapter = {
  mode: 'local',
  validate: async (request) => validateLocally(request),
}

const unavailableBackendValidationAdapter: ValidationAdapter = {
  mode: 'backend',
  validate: async () => ({ status: 'unavailable' }),
}

export function createValidationAdapter(mode: ValidationMode, backendAdapter?: ValidationAdapter): ValidationAdapter {
  return mode === 'backend' ? backendAdapter ?? unavailableBackendValidationAdapter : localValidationAdapter
}
