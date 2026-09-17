import { useState } from 'react'
import type { CodeLabDefinition } from './code-lab.types'
import { ChallengeShell } from '@/components/game/ChallengeShell'
import { Button } from '@/components/ui/Button'
import { ChallengeFeedback } from '@/components/game/ChallengeFeedback'

type Props = {
  codeLab: CodeLabDefinition
  onSuccess: (exposureDelta: number) => void
}

export function CodeLabRunner({ codeLab, onSuccess }: Props) {
  if (codeLab.type === 'fill_in_the_blank') return <FillInTheBlankCodeLab codeLab={codeLab} onSuccess={onSuccess} />
  if (codeLab.type === 'toggle_visibility') return <ToggleVisibilityCodeLab codeLab={codeLab} onSuccess={onSuccess} />

  return <ChallengeShell title={codeLab.title} instructions={codeLab.instructions} narrativeIntro={codeLab.narrativeIntro}>Code lab type not implemented yet.</ChallengeShell>
}

function CodeEditor({ value, onChange, minHeight = 280 }: { value: string; onChange: (value: string) => void; minHeight?: number }) {
  return (
    <div>
      <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Compact code</div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        style={{ width: '100%', minHeight, padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', background: '#0a0a0a', color: '#f5f5f5', fontFamily: 'Consolas, monospace', fontSize: 14, lineHeight: 1.6, resize: 'vertical' }}
      />
    </div>
  )
}

function FillInTheBlankCodeLab({ codeLab, onSuccess }: { codeLab: Extract<CodeLabDefinition, { type: 'fill_in_the_blank' }>; onSuccess: (exposureDelta: number) => void }) {
  const [sourceCode, setSourceCode] = useState(codeLab.payload.template)
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const expected = codeLab.payload.blanks[0]?.answer ?? ''
  const expectedSource = codeLab.payload.template.replace('___', expected)

  const submit = () => {
    if (sourceCode.trim() === expectedSource.trim()) {
      setResult('success')
      onSuccess(codeLab.effects?.onSuccess?.increaseExposure ?? 0)
      return
    }
    setResult('failure')
  }

  return (
    <ChallengeShell title={codeLab.title} instructions={codeLab.instructions} narrativeIntro={codeLab.narrativeIntro}>
      <CodeEditor value={sourceCode} onChange={setSourceCode} minHeight={220} />
      <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
        <Button onClick={submit} disabled={!sourceCode.trim()}>Validate</Button>
        <ChallengeFeedback result={result} />
      </div>
    </ChallengeShell>
  )
}

function ToggleVisibilityCodeLab({ codeLab, onSuccess }: { codeLab: Extract<CodeLabDefinition, { type: 'toggle_visibility' }>; onSuccess: (exposureDelta: number) => void }) {
  const initialValues = Object.fromEntries(codeLab.payload.fields.map((field) => [field.id, 'witness'])) as Record<string, 'ledger' | 'witness'>
  const buildLine = (fieldId: string, dataType: string, scope: 'ledger' | 'witness') =>
    scope === 'ledger' ? `export ledger ${fieldId}: ${dataType};` : `witness ${fieldId}(): ${dataType};`

  const buildCode = (values: Record<string, 'ledger' | 'witness'>) =>
    codeLab.payload.fields.map((field) => buildLine(field.id, field.dataType, values[field.id])).join('\n')

  const parseCode = (source: string) =>
    Object.fromEntries(
      codeLab.payload.fields.map((field) => {
        const ledgerMatch = source.match(new RegExp(`export\\s+ledger\\s+${field.id}\\s*:\\s*${field.dataType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*;`, 'i'))
        return [field.id, (ledgerMatch ? 'ledger' : 'witness') as 'ledger' | 'witness']
      }),
    ) as Record<string, 'ledger' | 'witness'>

  const [sourceCode, setSourceCode] = useState(buildCode(initialValues))
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const values = parseCode(sourceCode)
  const hasLedgerParenthesesError = codeLab.payload.fields.some((field) => sourceCode.match(new RegExp(`export\\s+ledger\\s+${field.id}\\s*\\(\\)\\s*:\\s*${field.dataType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*;`, 'i')))

  const submit = () => {
    if (hasLedgerParenthesesError) {
      setResult('failure')
      return
    }
    const ok = codeLab.payload.fields.every((field) => values[field.id] === field.expectedScope)
    if (ok) {
      setResult('success')
      onSuccess(codeLab.effects?.onSuccess?.increaseExposure ?? 0)
      return
    }
    setResult('failure')
  }

  const toggleField = (fieldId: string) => {
    const field = codeLab.payload.fields.find((item) => item.id === fieldId)
    if (!field) return
    const nextValue = values[fieldId] === 'ledger' ? 'witness' : 'ledger'
    const linePattern = new RegExp(`^(?:export\\s+ledger\\s+${fieldId}\\s*:\\s*${field.dataType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*;|witness\\s+${fieldId}\\s*\\(\\)\\s*:\\s*${field.dataType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*;)$`, 'im')
    const replacement = buildLine(field.id, field.dataType, nextValue)
    const nextCode = linePattern.test(sourceCode) ? sourceCode.replace(linePattern, replacement) : `${sourceCode}\n${replacement}`
    setSourceCode(nextCode)
  }

  return (
    <ChallengeShell title={codeLab.title} instructions={codeLab.instructions} narrativeIntro={codeLab.narrativeIntro}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(260px, 0.9fr)', gap: 16, alignItems: 'start' }}>
        <div>
          <CodeEditor value={sourceCode} onChange={setSourceCode} />
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ledger / Witness</div>
          {codeLab.payload.fields.map((field) => {
            const isLedger = values[field.id] === 'ledger'
            return (
              <button
                key={field.id}
                type="button"
                onClick={() => toggleField(field.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 14, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(17,17,17,0.82)', color: '#f5f5f5', cursor: 'pointer' }}
              >
                <div style={{ display: 'grid', gap: 2, textAlign: 'left' }}>
                  <span>{field.label}</span>
                  <span style={{ color: '#a1a1aa', fontSize: 12 }}>{field.dataType}</span>
                </div>
                <span aria-label={isLedger ? 'ledger público' : 'witness privado'} title={isLedger ? 'ledger público' : 'witness privado'} style={{ fontSize: 22 }}>{isLedger ? '👁️' : '🔐'}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
        <Button onClick={submit}>Validate</Button>
        <ChallengeFeedback result={result} />
      </div>
      {hasLedgerParenthesesError ? (
        <p style={{ marginTop: 12, color: '#fca5a5', lineHeight: 1.6 }}>
          `export ledger` no lleva paréntesis. Usa `export ledger nombre: Tipo;`. Los paréntesis se usan en `witness nombre(): Tipo;`.
        </p>
      ) : null}
    </ChallengeShell>
  )
}
