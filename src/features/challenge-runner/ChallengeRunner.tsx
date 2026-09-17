import { useMemo, useState } from 'react'
import type { ChallengeDefinition } from './challenge.types'
import { ChallengeShell } from '@/components/game/ChallengeShell'
import { Button } from '@/components/ui/Button'
import { ChallengeFeedback } from '@/components/game/ChallengeFeedback'

type Props = {
  challenge: ChallengeDefinition
  onSuccess: (exposureDelta: number) => void
}

export function ChallengeRunner({ challenge, onSuccess }: Props) {
  if (challenge.type === 'trivia') return <TriviaChallenge challenge={challenge} onSuccess={onSuccess} />
  if (challenge.type === 'visibility_editor') return <VisibilityEditorChallenge challenge={challenge} onSuccess={onSuccess} />
  if (challenge.type === 'drag_and_drop') return <DragAndDropChallenge challenge={challenge} onSuccess={onSuccess} />

  return <ChallengeShell title={challenge.title} instructions={challenge.instructions} narrativeIntro={challenge.narrativeIntro}>Challenge type not implemented yet.</ChallengeShell>
}

function shuffleArray<T>(items: T[]) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }

  return shuffled
}

function TriviaChallenge({ challenge, onSuccess }: { challenge: Extract<ChallengeDefinition, { type: 'trivia' }>; onSuccess: (exposureDelta: number) => void }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const correct = useMemo(() => challenge.payload.correctOptionId, [challenge.payload.correctOptionId])
  const options = useMemo(() => shuffleArray(challenge.payload.options), [challenge.challengeId, challenge.payload.options])

  const submit = () => {
    if (selected === correct) {
      setResult('success')
      onSuccess(challenge.effects?.onSuccess?.increaseExposure ?? 0)
      return
    }
    setResult('failure')
  }

  return (
    <ChallengeShell title={challenge.title} instructions={challenge.instructions} narrativeIntro={challenge.narrativeIntro}>
      <p style={{ fontSize: 18, marginTop: 0 }}><strong>{challenge.payload.question}</strong></p>
      <div style={{ display: 'grid', gap: 10 }}>
        {options.map((option) => (
          <label
            key={option.id}
            style={{
              display: 'flex',
              gap: 10,
              padding: 14,
              border: selected === option.id ? '1px solid rgba(56,189,248,0.8)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              background: selected === option.id ? 'rgba(14,35,46,0.72)' : 'rgba(17,17,17,0.8)',
            }}
          >
            <input type="radio" checked={selected === option.id} onChange={() => setSelected(option.id)} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
        <Button onClick={submit} disabled={!selected}>Submit</Button>
        <ChallengeFeedback result={result} />
      </div>
    </ChallengeShell>
  )
}

function VisibilityEditorChallenge({ challenge, onSuccess }: { challenge: Extract<ChallengeDefinition, { type: 'visibility_editor' }>; onSuccess: (exposureDelta: number) => void }) {
  const [values, setValues] = useState<Record<string, 'public' | 'private'>>(
    Object.fromEntries(challenge.payload.fields.map((field) => [field.id, 'private'])) as Record<string, 'public' | 'private'>,
  )
  const [result, setResult] = useState<'success' | 'failure' | null>(null)

  const submit = () => {
    const ok = challenge.payload.fields.every((field) => values[field.id] === field.expectedVisibility)
    if (ok) {
      setResult('success')
      onSuccess(challenge.effects?.onSuccess?.increaseExposure ?? 0)
      return
    }
    setResult('failure')
  }

  return (
    <ChallengeShell title={challenge.title} instructions={challenge.instructions} narrativeIntro={challenge.narrativeIntro}>
      <div style={{ display: 'grid', gap: 12 }}>
        {challenge.payload.fields.map((field) => (
          <div key={field.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: 12, border: '1px solid #27272a', borderRadius: 10 }}>
            <strong>{field.label}</strong>
            <select
              value={values[field.id]}
              onChange={(event) =>
                setValues((current) => ({ ...current, [field.id]: event.target.value as 'public' | 'private' }))
              }
              style={{ background: '#0a0a0a', color: '#f5f5f5', border: '1px solid #27272a', borderRadius: 10, padding: '8px 12px', minWidth: 110 }}
            >
              <option value="private">private</option>
              <option value="public">public</option>
            </select>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, alignItems: 'center' }}>
        <Button onClick={submit}>Validate</Button>
        <ChallengeFeedback result={result} />
      </div>
    </ChallengeShell>
  )
}
function DragAndDropChallenge({ challenge, onSuccess }: { challenge: Extract<ChallengeDefinition, { type: 'drag_and_drop' }>; onSuccess: (exposureDelta: number) => void }) {
  const [assignments, setAssignments] = useState<Record<string, string>>({}) // itemid -> zoneid
  const [result, setResult] = useState<'success' | 'failure' | null>(null)

  // Randomize items on first load and keep them stable
  const items = useMemo(() => {
    return [...challenge.payload.items].sort(() => Math.random() - 0.5)
  }, [challenge.payload.items])

  const zones = challenge.payload.zones

  const onDragStart = (event: React.DragEvent, itemId: string) => {
    event.dataTransfer.setData('itemId', itemId)
  }

  const onDrop = (event: React.DragEvent, zoneId: string) => {
    const itemId = event.dataTransfer.getData('itemId')
    if (itemId) {
      setAssignments((prev) => ({ ...prev, [itemId]: zoneId }))
      setResult(null) // Clear result on change
    }
  }

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault()
  }

  const removeItem = (itemId: string) => {
    setAssignments((prev) => {
      const next = { ...prev }
      delete next[itemId]
      return next
    })
    setResult(null) // Clear result on change
  }

  const reset = () => {
    setAssignments({})
    setResult(null)
  }

  const submit = () => {
    if (Object.keys(assignments).length < items.length) {
      setResult('failure')
      return
    }

    const ok = items.every((item) => assignments[item.id] === challenge.payload.validAssignments[item.id])
    if (ok) {
      setResult('success')
      onSuccess(challenge.effects?.onSuccess?.increaseExposure ?? 0)
      return
    }
    setResult('failure')
  }

  return (
    <ChallengeShell title={challenge.title} instructions={challenge.instructions} narrativeIntro={challenge.narrativeIntro}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, minHeight: 350 }}>
        {/* Items Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 12, height: 2, background: '#38bdf8' }}></span>
              Datos a Clasificar
            </div>
            <button 
              onClick={reset}
              style={{ fontSize: 11, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '4px 8px', borderRadius: 6, cursor: 'pointer' }}
            >
              Reiniciar
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map((item) => {
              const isAssigned = !!assignments[item.id]
              return (
                <div
                  key={item.id}
                  draggable={!isAssigned}
                  onDragStart={(e) => onDragStart(e, item.id)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 16,
                    background: isAssigned ? 'rgba(255,255,255,0.02)' : 'rgba(30,41,59,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: isAssigned ? '#64748b' : '#f8fafc',
                    cursor: isAssigned ? 'default' : 'grab',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: isAssigned ? 0.6 : 1,
                    userSelect: 'none'
                  }}
                >
                  <span>{item.label}</span>
                  {isAssigned ? (
                    <span style={{ fontSize: 10, color: '#38bdf8', fontWeight: 600 }}>✓ Guardado</span>
                  ) : (
                    <span style={{ opacity: 0.3 }}>⋮⋮</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Zones Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {zones.map((zone) => {
            const isWitness = zone.id === 'witness'
            const assignedItems = Object.entries(assignments).filter(([_, zid]) => zid === zone.id)
            
            return (
              <div
                key={zone.id}
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, zone.id)}
                style={{
                  flex: 1,
                  padding: 24,
                  borderRadius: 24,
                  border: '2px dashed rgba(56,189,248,0.3)',
                  background: isWitness ? 'linear-gradient(145deg, rgba(15,23,42,0.8), rgba(2,6,23,0.9))' : 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isWitness && (
                  <div style={{ 
                    position: 'absolute', 
                    top: -20, 
                    right: -20, 
                    fontSize: 80, 
                    opacity: 0.05, 
                    transform: 'rotate(-15deg)',
                    pointerEvents: 'none'
                  }}>🔒</div>
                )}
                
                <div style={{ 
                  fontSize: 18, 
                  fontWeight: 800, 
                  color: isWitness ? '#38bdf8' : '#cbd5e1',
                  marginBottom: 16,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {zone.label}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                   {assignedItems.length > 0 ? (
                     assignedItems.map(([iid]) => (
                       <button 
                         key={iid} 
                         onClick={() => removeItem(iid)}
                         title="Haz clic para quitar"
                         style={{ 
                           background: isWitness ? '#38bdf8' : '#475569', 
                           color: isWitness ? '#0f172a' : '#f1f5f9', 
                           fontSize: 11, 
                           padding: '6px 12px', 
                           borderRadius: 8, 
                           fontWeight: 700,
                           border: 'none',
                           cursor: 'pointer',
                           display: 'flex',
                           alignItems: 'center',
                           gap: 4
                         }}
                       >
                         {items.find(i => i.id === iid)?.label}
                         <span style={{ fontSize: 14, opacity: 0.5 }}>×</span>
                       </button>
                     ))
                   ) : (
                     <div style={{ color: '#475569', fontSize: 13, fontStyle: 'italic' }}>
                       Arrastra datos aquí
                     </div>
                   )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 32, alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
        <Button 
          onClick={submit} 
          disabled={Object.keys(assignments).length < items.length && result !== 'failure'}
          variant="primary"
          style={{ paddingLeft: 32, paddingRight: 32, height: 50, fontSize: 16 }}
        >
          {result === 'failure' ? 'Reintentar' : 'Finalizar Operación'}
        </Button>
        <ChallengeFeedback result={result} />
      </div>
    </ChallengeShell>
  )
}
