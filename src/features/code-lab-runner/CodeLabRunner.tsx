import { useEffect, useState } from 'react'
import type { CodeLabDefinition } from './code-lab.types'
import { ChallengeShell } from '@/components/game/ChallengeShell'
import { Button } from '@/components/ui/Button'
import { ChallengeFeedback } from '@/components/game/ChallengeFeedback'
import { CodeEditor } from './CodeEditor'
import { useAppStore } from '@/app/store/app-store'
import { useTranslation } from 'react-i18next'
import { createValidationAdapter } from './validation-adapter'

type Props = {
  codeLab: CodeLabDefinition
  onSuccess: (exposureDelta: number) => void
}

export function CodeLabRunner({ codeLab, onSuccess }: Props) {
  if (codeLab.type === 'fill_in_the_blank') return <FillInTheBlankCodeLab key={codeLab.codeLabId} codeLab={codeLab} onSuccess={onSuccess} />
  if (codeLab.type === 'toggle_visibility') return <ToggleVisibilityCodeLab key={codeLab.codeLabId} codeLab={codeLab} onSuccess={onSuccess} />

  return <ChallengeShell title={codeLab.title} instructions={codeLab.instructions} narrativeIntro={codeLab.narrativeIntro}>Code lab type not implemented yet.</ChallengeShell>
}

function FillInTheBlankCodeLab({ codeLab, onSuccess }: { codeLab: Extract<CodeLabDefinition, { type: 'fill_in_the_blank' }>; onSuccess: (exposureDelta: number) => void }) {
  const { sourceCode, setSourceCode, isReady } = useWorkspaceSource(codeLab, codeLab.payload.template)
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const recordWorkspaceValidation = useAppStore((state) => state.recordWorkspaceValidation)
  const validationMode = useAppStore((state) => state.validationMode)
  const { t } = useTranslation('common')

  const submit = async () => {
    setIsValidating(true)
    setUnavailable(false)
    const validation = await createValidationAdapter(validationMode).validate({ codeLab, sourceCode })
    setIsValidating(false)
    if (validation.status === 'unavailable') {
      setResult(null)
      setUnavailable(true)
      return
    }
    const snapshotCreated = codeLab.workspace
      ? recordWorkspaceValidation({ status: validation.status, codeLabId: codeLab.codeLabId }, validation.status === 'success' && codeLab.workspace.snapshotOnSuccess, sourceCode, codeLab.workspace)
      : true
    setResult(snapshotCreated ? validation.status : 'failure')
    if (validation.status === 'success' && snapshotCreated) onSuccess(codeLab.effects?.onSuccess?.increaseExposure ?? 0)
  }

  return (
    <ChallengeShell title={codeLab.title} instructions={codeLab.instructions} narrativeIntro={codeLab.narrativeIntro}>
      <ValidationStatus mode={validationMode} />
      {isReady ? <CodeEditor value={sourceCode} onChange={setSourceCode} modelKey={codeLab.codeLabId} minHeight={220} /> : <EditorLoadingPlaceholder />}
      <div className="code-lab-runner__actions">
        <Button onClick={() => void submit()} disabled={!sourceCode.trim() || isValidating}>{t('challenge.validate')}</Button>
        <ChallengeFeedback result={result} />
      </div>
      {unavailable ? <p style={{ color: '#fca5a5', lineHeight: 1.6 }}>{t('challenge.validationUnavailable')}</p> : null}
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

  const { sourceCode, setSourceCode, isReady } = useWorkspaceSource(codeLab, buildCode(initialValues))
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const [unavailable, setUnavailable] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const recordWorkspaceValidation = useAppStore((state) => state.recordWorkspaceValidation)
  const validationMode = useAppStore((state) => state.validationMode)
  const { t } = useTranslation('common')
  const values = parseCode(sourceCode)
  const hasLedgerParenthesesError = codeLab.payload.fields.some((field) => sourceCode.match(new RegExp(`export\\s+ledger\\s+${field.id}\\s*\\(\\)\\s*:\\s*${field.dataType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*;`, 'i')))

  const submit = async () => {
    setIsValidating(true)
    setUnavailable(false)
    const validation = await createValidationAdapter(validationMode).validate({ codeLab, sourceCode })
    setIsValidating(false)
    if (validation.status === 'unavailable') {
      setResult(null)
      setUnavailable(true)
      return
    }
    const snapshotCreated = codeLab.workspace
      ? recordWorkspaceValidation({ status: validation.status, codeLabId: codeLab.codeLabId }, validation.status === 'success' && codeLab.workspace.snapshotOnSuccess, sourceCode, codeLab.workspace)
      : true
    setResult(snapshotCreated ? validation.status : 'failure')
    if (validation.status === 'success' && snapshotCreated) onSuccess(codeLab.effects?.onSuccess?.increaseExposure ?? 0)
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
      <ValidationStatus mode={validationMode} />
      <div className="code-lab-runner__layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.3fr) minmax(260px, 0.9fr)', gap: 16, alignItems: 'start' }}>
        <div className="code-lab-runner__primary">
          {isReady ? <CodeEditor value={sourceCode} onChange={setSourceCode} modelKey={codeLab.codeLabId} /> : <EditorLoadingPlaceholder />}
        </div>
        <div className="code-lab-runner__secondary" style={{ display: 'grid', gap: 12 }}>
          <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Ledger / Witness</div>
          {codeLab.payload.fields.map((field) => {
            const isLedger = values[field.id] === 'ledger'
            return (
              <button
                className="code-lab-runner__field"
                key={field.id}
                type="button"
                onClick={() => toggleField(field.id)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: 14, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(17,17,17,0.82)', color: '#f5f5f5', cursor: 'pointer' }}
              >
                <div className="code-lab-runner__field-copy" style={{ display: 'grid', gap: 2, textAlign: 'left' }}>
                  <span>{field.label}</span>
                  <span style={{ color: '#a1a1aa', fontSize: 12 }}>{field.dataType}</span>
                </div>
                <span aria-label={isLedger ? 'ledger público' : 'witness privado'} title={isLedger ? 'ledger público' : 'witness privado'} style={{ fontSize: 22 }}>{isLedger ? '👁️' : '🔐'}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="code-lab-runner__actions">
        <Button onClick={() => void submit()} disabled={isValidating}>{t('challenge.validate')}</Button>
        <ChallengeFeedback result={result} />
      </div>
      {unavailable ? <p style={{ color: '#fca5a5', lineHeight: 1.6 }}>{t('challenge.validationUnavailable')}</p> : null}
      {hasLedgerParenthesesError && validationMode === 'local' ? (
        <p className="code-lab-runner__validation-error" style={{ marginTop: 12, color: '#fca5a5', lineHeight: 1.6 }}>
          {t('challenge.validationErrors.ledgerParentheses')}
        </p>
      ) : null}
    </ChallengeShell>
  )
}

function ValidationStatus({ mode }: { mode: 'local' | 'backend' }) {
  const { t } = useTranslation('common')
  return <p style={{ margin: '0 0 12px', color: '#a1a1aa', fontSize: 13 }}>{t(`settings.validationStatus.${mode}`)}</p>
}

function EditorLoadingPlaceholder() {
  return <div className="code-lab-runner__editor-loading" role="status" aria-live="polite" aria-busy="true">Loading editor…</div>
}

function useWorkspaceSource(codeLab: CodeLabDefinition, template: string): { sourceCode: string; setSourceCode: (source: string) => void; isReady: boolean } {
  const initializeWorkspace = useAppStore((state) => state.initializeWorkspace)
  const updateWorkspaceDraft = useAppStore((state) => state.updateWorkspaceDraft)
  const [sourceCode, setSourceCode] = useState(template)
  const workspaceKey = codeLab.workspace ? `${codeLab.workspace.workspaceId}:${codeLab.codeLabId}` : 'legacy'
  const [initializedKey, setInitializedKey] = useState(codeLab.workspace ? null : 'legacy')

  useEffect(() => {
    if (!codeLab.workspace) return
    setSourceCode(initializeWorkspace(codeLab.workspace, template, codeLab.codeLabId))
    setInitializedKey(workspaceKey)
  }, [codeLab, initializeWorkspace, template])

  useEffect(() => {
    if (codeLab.workspace && initializedKey === workspaceKey) updateWorkspaceDraft(sourceCode, codeLab.codeLabId)
  }, [codeLab.codeLabId, codeLab.workspace, initializedKey, sourceCode, updateWorkspaceDraft, workspaceKey])

  return { sourceCode, setSourceCode, isReady: initializedKey === workspaceKey }
}
