import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChallengeDefinition } from './challenge.types'
import { ChallengeShell } from '@/components/game/ChallengeShell'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ChallengeFeedback } from '@/components/game/ChallengeFeedback'

type Props = {
  challenge: ChallengeDefinition
  onSuccess: (exposureDelta: number) => void
  onSuccessContinue?: () => void
}

export function ChallengeRunner({ challenge, onSuccess, onSuccessContinue }: Props) {
  if (challenge.type === 'trivia') return <TriviaChallenge challenge={challenge} onSuccess={onSuccess} />
  if (challenge.type === 'code_assembly') return <CodeAssemblyChallenge challenge={challenge} onSuccess={onSuccess} onSuccessContinue={onSuccessContinue} />
  if (challenge.type === 'state_simulation') return <StateSimulationChallenge challenge={challenge} onSuccess={onSuccess} onSuccessContinue={onSuccessContinue} />
  if (challenge.type === 'visibility_editor') return <VisibilityEditorChallenge challenge={challenge} onSuccess={onSuccess} />
  if (challenge.type === 'drag_and_drop') return <DragAndDropChallenge challenge={challenge} onSuccess={onSuccess} />
  if (challenge.type === 'type_matching') return <TypeMatchingChallenge challenge={challenge} onSuccess={onSuccess} />
  if (challenge.type === 'final_assembly') return <FinalAssemblyChallenge challenge={challenge} onSuccess={onSuccess} onSuccessContinue={onSuccessContinue} />

  return <ChallengeShell title={challenge.title} instructions={challenge.instructions} narrativeIntro={challenge.narrativeIntro}>Challenge type not implemented yet.</ChallengeShell>
}

function TypeMatchingChallenge({ challenge, onSuccess }: { challenge: Extract<ChallengeDefinition, { type: 'type_matching' }>; onSuccess: (exposureDelta: number) => void }) {
  const { t } = useTranslation('common')
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const successNotified = useRef(false)
  const optionById = useMemo(() => new Map(challenge.payload.options.map((option) => [option.id, option])), [challenge.payload.options])
  const promptById = useMemo(() => new Map(challenge.payload.prompts.map((prompt) => [prompt.id, prompt])), [challenge.payload.prompts])
  const options = useMemo(() => {
    const shuffled = shuffleArray(challenge.payload.options)
    const keepsOriginalOrder = shuffled.every((option, index) => option.id === challenge.payload.options[index]?.id)
    if (keepsOriginalOrder && shuffled.length > 1) [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
    return shuffled
  }, [challenge.challengeId, challenge.payload.options])
  const matchedCount = Object.keys(matches).length
  const allPromptsMatched = challenge.payload.prompts.every((prompt) => Boolean(matches[prompt.id]))
  const hintId = `${challenge.challengeId}-matching-hint`

  const getPromptIdForOption = (optionId: string) => Object.entries(matches).find(([, matchedId]) => matchedId === optionId)?.[0] ?? null

  const assignMatch = (promptId: string, optionId: string) => {
    if (successNotified.current) return

    setMatches((current) => {
      const next = { ...current }
      delete next[promptId]
      Object.entries(next).forEach(([matchedPromptId, matchedOptionId]) => {
        if (matchedOptionId === optionId) delete next[matchedPromptId]
      })
      next[promptId] = optionId
      return next
    })
    setSelectedPromptId(null)
    setSelectedOptionId(null)
    setResult(null)
  }

  const selectPrompt = (promptId: string) => {
    if (successNotified.current) return
    if (selectedOptionId) {
      assignMatch(promptId, selectedOptionId)
      return
    }
    setSelectedPromptId((current) => (current === promptId ? null : promptId))
    setSelectedOptionId(null)
  }

  const selectOption = (optionId: string) => {
    if (successNotified.current) return
    if (selectedPromptId) {
      assignMatch(selectedPromptId, optionId)
      return
    }

    const matchedPromptId = getPromptIdForOption(optionId)
    if (matchedPromptId) {
      setSelectedPromptId(matchedPromptId)
      setSelectedOptionId(optionId)
      return
    }
    setSelectedOptionId((current) => (current === optionId ? null : optionId))
  }

  const removeMatch = (promptId: string) => {
    if (successNotified.current) return
    setMatches((current) => {
      const next = { ...current }
      delete next[promptId]
      return next
    })
    setSelectedPromptId(null)
    setSelectedOptionId(null)
    setResult(null)
  }

  const reset = () => {
    setMatches({})
    setSelectedPromptId(null)
    setSelectedOptionId(null)
    setResult(null)
  }

  const submit = () => {
    if (!allPromptsMatched || successNotified.current) return
    const isCorrect = challenge.payload.prompts.every((prompt) => matches[prompt.id] === challenge.payload.correctMatches[prompt.id])
    if (!isCorrect) {
      setResult('failure')
      return
    }

    setResult('success')
    if (!successNotified.current) {
      successNotified.current = true
      onSuccess(challenge.effects?.onSuccess?.increaseExposure ?? 0)
    }
  }

  return (
    <ChallengeShell title={challenge.title} instructions={challenge.instructions} narrativeIntro={challenge.narrativeIntro}>
      <div className="challenge-type-matching">
        <p id={hintId} className="challenge-type-matching__hint">{t('challenge.typeMatching.matchHint')}</p>
        <p className="challenge-type-matching__count" aria-live="polite">{t('challenge.typeMatching.matchesCount', { current: matchedCount, total: challenge.payload.prompts.length })}</p>

        <div className="challenge-type-matching__columns">
          <Card>
            <section className="challenge-type-matching__column" aria-labelledby={`${challenge.challengeId}-concepts-title`}>
              <h3 id={`${challenge.challengeId}-concepts-title`} className="challenge-type-matching__heading">{t('challenge.typeMatching.concepts')}</h3>
              <p className="challenge-type-matching__instruction">{t('challenge.typeMatching.selectPrompt')}</p>
              <div className="challenge-type-matching__cards" role="list">
                {challenge.payload.prompts.map((prompt) => {
                  const option = optionById.get(matches[prompt.id])
                  const isSelected = selectedPromptId === prompt.id
                  return (
                    <div key={prompt.id} className="challenge-type-matching__match" data-matched={option ? 'true' : 'false'} role="listitem">
                      <button
                        type="button"
                        className="challenge-type-matching__card"
                        aria-pressed={isSelected}
                        aria-describedby={hintId}
                        aria-label={t('challenge.typeMatching.promptAriaLabel', { label: prompt.label })}
                        data-selected={isSelected ? 'true' : 'false'}
                        data-matched={option ? 'true' : 'false'}
                        disabled={successNotified.current}
                        onClick={() => selectPrompt(prompt.id)}
                      >
                        <span className="challenge-type-matching__label">{prompt.label}</span>
                        <span className="challenge-type-matching__status">{isSelected ? t('challenge.typeMatching.selected') : option ? t('challenge.typeMatching.matched') : t('challenge.typeMatching.unmatched')}</span>
                      </button>
                      {option ? (
                        <div className="challenge-type-matching__assignment">
                          <span className="challenge-type-matching__assignment-arrow" aria-hidden="true">→</span>
                          <span className="challenge-type-matching__assignment-label">{t('challenge.typeMatching.matchedWith', { label: option.label })}</span>
                          <button
                            type="button"
                            className="challenge-type-matching__remove"
                            aria-label={t('challenge.typeMatching.removeMatchAriaLabel', { action: t('challenge.typeMatching.removeMatch'), label: prompt.label })}
                            disabled={successNotified.current}
                            onClick={() => removeMatch(prompt.id)}
                          >
                            {t('challenge.typeMatching.removeMatch')}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </section>
          </Card>

          <Card>
            <section className="challenge-type-matching__column" aria-labelledby={`${challenge.challengeId}-consequences-title`}>
              <h3 id={`${challenge.challengeId}-consequences-title`} className="challenge-type-matching__heading">{t('challenge.typeMatching.consequences')}</h3>
              <p className="challenge-type-matching__instruction">{t('challenge.typeMatching.selectOption')}</p>
              <div className="challenge-type-matching__cards" role="list">
                {options.map((option) => {
                  const matchedPromptId = getPromptIdForOption(option.id)
                  const matchedPrompt = matchedPromptId ? promptById.get(matchedPromptId) : undefined
                  const isSelected = selectedOptionId === option.id
                  return (
                    <div key={option.id} className="challenge-type-matching__match" role="listitem">
                      <button
                        type="button"
                        className="challenge-type-matching__card"
                        aria-pressed={isSelected}
                        aria-describedby={hintId}
                        aria-label={t('challenge.typeMatching.optionAriaLabel', { label: option.label })}
                        data-selected={isSelected ? 'true' : 'false'}
                        data-matched={matchedPrompt ? 'true' : 'false'}
                        disabled={successNotified.current}
                        onClick={() => selectOption(option.id)}
                      >
                        <span className="challenge-type-matching__label">{option.label}</span>
                        <span className="challenge-type-matching__status">{matchedPrompt ? t('challenge.typeMatching.matchedWith', { label: matchedPrompt.label }) : isSelected ? t('challenge.typeMatching.selected') : t('challenge.typeMatching.unmatched')}</span>
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          </Card>
        </div>

        <section className="challenge-type-matching__summary" aria-labelledby={`${challenge.challengeId}-summary-title`}>
          <h3 id={`${challenge.challengeId}-summary-title`} className="challenge-type-matching__summary-heading">{t('challenge.typeMatching.assignment')}</h3>
          {challenge.payload.prompts.some((prompt) => matches[prompt.id]) ? (
            <div className="challenge-type-matching__summary-list" role="list">
              {challenge.payload.prompts.map((prompt) => {
                const option = optionById.get(matches[prompt.id])
                return option ? (
                  <div key={prompt.id} className="challenge-type-matching__summary-row" role="listitem">
                    <span>{prompt.label}</span>
                    <span aria-hidden="true">→</span>
                    <span>{option.label}</span>
                  </div>
                ) : null
              })}
            </div>
          ) : <p className="challenge-type-matching__empty">{t('challenge.typeMatching.unmatched')}</p>}
        </section>

        <div className="challenge-type-matching__actions">
          <Button onClick={submit} disabled={!allPromptsMatched || successNotified.current}>{t('challenge.typeMatching.check')}</Button>
          <Button variant="ghost" onClick={reset}>{t('challenge.typeMatching.reset')}</Button>
          <ChallengeFeedback result={result} />
        </div>
      </div>
    </ChallengeShell>
  )
}

function FinalAssemblyChallenge({ challenge, onSuccess, onSuccessContinue }: { challenge: Extract<ChallengeDefinition, { type: 'final_assembly' }>; onSuccess: (exposureDelta: number) => void; onSuccessContinue?: () => void }) {
  const { t } = useTranslation('common')
  const stages = challenge.payload.stages
  const [activeStageIndex, setActiveStageIndex] = useState(0)
  const [completedStageCount, setCompletedStageCount] = useState(0)
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null)
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const [isFinalSuccess, setIsFinalSuccess] = useState(false)
  const successNotified = useRef(false)
  const activeStage = stages[activeStageIndex]

  const selectPiece = (pieceId: string) => {
    if (result === 'success' || isFinalSuccess) return
    setSelectedPieceId((current) => (current === pieceId ? null : pieceId))
    setResult(null)
  }

  const confirmStage = () => {
    if (!activeStage || !selectedPieceId || isFinalSuccess) return

    if (selectedPieceId !== activeStage.correctPieceId) {
      setResult('failure')
      return
    }

    setResult('success')
    if (activeStageIndex === stages.length - 1) {
      setCompletedStageCount(stages.length)
      setIsFinalSuccess(true)
      if (!successNotified.current) {
        successNotified.current = true
        onSuccess(challenge.effects?.onSuccess?.increaseExposure ?? 0)
      }
    }
  }

  const goToNextStage = () => {
    if (result !== 'success' || activeStageIndex >= stages.length - 1) return
    setCompletedStageCount(activeStageIndex + 1)
    setActiveStageIndex((current) => current + 1)
    setSelectedPieceId(null)
    setResult(null)
  }

  return (
    <ChallengeShell title={challenge.title} instructions={challenge.instructions} narrativeIntro={challenge.narrativeIntro}>
      <div className="challenge-final-assembly">
        <div className="challenge-final-assembly__progress" aria-live="polite">
          <strong>{t('challenge.finalAssembly.stageProgress', { current: isFinalSuccess ? stages.length : activeStageIndex + 1, total: stages.length })}</strong>
          <div className="challenge-final-assembly__progress-track" aria-hidden="true">
            <span style={{ width: `${(completedStageCount / stages.length) * 100}%` }} />
          </div>
        </div>

        {stages.slice(0, completedStageCount).map((stage, index) => (
          <Card key={stage.id}>
            <section className="challenge-final-assembly__completed" aria-labelledby={`${challenge.challengeId}-${stage.id}-completed-title`}>
              <div className="challenge-final-assembly__completed-heading">
                <span className="challenge-final-assembly__stage-number" aria-hidden="true">{index + 1}</span>
                <div>
                  <span className="challenge-final-assembly__completed-label">{t('challenge.finalAssembly.completedStage')}</span>
                  <h3 id={`${challenge.challengeId}-${stage.id}-completed-title`}>{stage.title}</h3>
                </div>
              </div>
              <p>{stage.explanation}</p>
            </section>
          </Card>
        ))}

        {!isFinalSuccess && activeStage ? (
          <Card>
            <section className="challenge-final-assembly__active" aria-labelledby={`${challenge.challengeId}-${activeStage.id}-title`}>
              <div className="challenge-final-assembly__active-heading">
                <span className="challenge-final-assembly__stage-number" aria-hidden="true">{activeStageIndex + 1}</span>
                <div>
                  <span className="challenge-final-assembly__active-label">{t('challenge.finalAssembly.stageProgress', { current: activeStageIndex + 1, total: stages.length })}</span>
                  <h3 id={`${challenge.challengeId}-${activeStage.id}-title`}>{activeStage.title}</h3>
                </div>
              </div>
              <p className="challenge-final-assembly__description">{activeStage.description}</p>
              <p className="challenge-final-assembly__select-hint">{t('challenge.finalAssembly.selectPiece')}</p>
              <div className="challenge-final-assembly__pieces" role="radiogroup" aria-labelledby={`${challenge.challengeId}-${activeStage.id}-title`}>
                {activeStage.pieces.map((piece) => {
                  const isSelected = selectedPieceId === piece.id
                  return (
                    <button
                      key={piece.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={t('challenge.finalAssembly.pieceAriaLabel', { label: piece.label })}
                      className="challenge-final-assembly__piece"
                      data-selected={isSelected ? 'true' : 'false'}
                      disabled={result === 'success'}
                      onClick={() => selectPiece(piece.id)}
                    >
                      <span className="challenge-final-assembly__piece-label">{piece.label}</span>
                      <span className="challenge-final-assembly__piece-status">{isSelected ? t('challenge.finalAssembly.selected') : t('challenge.finalAssembly.notSelected')}</span>
                    </button>
                  )
                })}
              </div>
              <div className="challenge-final-assembly__actions">
                <Button onClick={confirmStage} disabled={!selectedPieceId || result === 'success'}>{t('challenge.finalAssembly.confirm')}</Button>
                <ChallengeFeedback result={result} />
              </div>
              {result === 'success' ? (
                <div className="challenge-final-assembly__explanation" role="status">
                  <strong>{t('challenge.finalAssembly.completedStage')}</strong>
                  <p>{activeStage.explanation}</p>
                  <Button variant="primary" onClick={goToNextStage}>{t('challenge.finalAssembly.nextStage')}</Button>
                </div>
              ) : null}
            </section>
          </Card>
        ) : null}

        {isFinalSuccess ? (
          <Card>
            <section className="challenge-final-assembly__final" aria-labelledby={`${challenge.challengeId}-final-summary-title`}>
              <span className="challenge-final-assembly__final-label">{t('challenge.finalAssembly.finalSummary')}</span>
              <h3 id={`${challenge.challengeId}-final-summary-title`}>{t('challenge.finalAssembly.finalSummaryTitle')}</h3>
              <p>{challenge.payload.finalSummary}</p>
              <div className="challenge-final-assembly__final-feedback">
                <ChallengeFeedback result="success" />
                {onSuccessContinue ? <Button variant="primary" onClick={onSuccessContinue}>{t('challenge.finalAssembly.continue')}</Button> : null}
              </div>
            </section>
          </Card>
        ) : null}
      </div>
    </ChallengeShell>
  )
}

function StateSimulationChallenge({ challenge, onSuccess, onSuccessContinue }: { challenge: Extract<ChallengeDefinition, { type: 'state_simulation' }>; onSuccess: (exposureDelta: number) => void; onSuccessContinue?: () => void }) {
  const { t } = useTranslation('common')
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [processedAttemptIndex, setProcessedAttemptIndex] = useState(0)
  const [ledgerEntries, setLedgerEntries] = useState<string[]>(() => [...challenge.payload.initialEntries])
  const [eventHistory, setEventHistory] = useState<Array<{
    id: string
    title: string
    outcome: 'accepted' | 'rejected'
    ledgerEntry: string
    reason: string
    completedLineIds: string[]
    activeLineId: string
  }>>([])
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const successNotified = useRef(false)
  const currentAttempt = challenge.payload.attempts[processedAttemptIndex]
  const selectedOption = challenge.payload.survey.options.find((option) => option.id === selectedOptionId)
  const hasAcceptedVote = eventHistory.some((event) => event.outcome === 'accepted')
  const latestEvent = eventHistory[eventHistory.length - 1]

  const getLineState = (lineId: string) => {
    if (latestEvent?.activeLineId === lineId) return latestEvent.outcome === 'rejected' ? 'rejected' : 'active'
    if (eventHistory.some((event) => event.completedLineIds.includes(lineId))) return 'completed'
    return 'pending'
  }

  const processVote = () => {
    if (!currentAttempt || !selectedOptionId || processedAttemptIndex >= challenge.payload.attempts.length) return

    const event = {
      id: currentAttempt.id,
      title: currentAttempt.title,
      outcome: currentAttempt.outcome,
      ledgerEntry: currentAttempt.ledgerEntry,
      reason: currentAttempt.reason,
      completedLineIds: currentAttempt.completedLineIds,
      activeLineId: currentAttempt.activeLineId,
    }
    const nextEventHistory = [...eventHistory, event]
    const nextAttemptIndex = processedAttemptIndex + 1
    const isSuccessfulSequence = nextEventHistory.length >= 2
      && nextEventHistory[0].outcome === 'accepted'
      && nextEventHistory[1].outcome === 'rejected'

    setEventHistory(nextEventHistory)

    if (currentAttempt.outcome === 'accepted' && currentAttempt.ledgerEntry) {
      setLedgerEntries((current) => [...current, currentAttempt.ledgerEntry])
    }

    setProcessedAttemptIndex(nextAttemptIndex)
    if (nextAttemptIndex >= 2) setResult(isSuccessfulSequence ? 'success' : 'failure')
  }

  useEffect(() => {
    if (result !== 'success' || successNotified.current) return
    successNotified.current = true
    onSuccess(challenge.effects?.onSuccess?.increaseExposure ?? 0)
  }, [challenge.effects, onSuccess, result])

  const reset = () => {
    setSelectedOptionId(null)
    setProcessedAttemptIndex(0)
    setLedgerEntries([...challenge.payload.initialEntries])
    setEventHistory([])
    setResult(null)
  }

  return (
    <ChallengeShell title={challenge.title} instructions={challenge.instructions} narrativeIntro={challenge.narrativeIntro}>
      <div className="challenge-state-simulation">
        <p className="challenge-state-simulation__note">{t('challenge.stateSimulation.simulationNote')}</p>
        <div className="challenge-state-simulation__columns">
          <Card>
            <section className="challenge-state-simulation__survey" aria-labelledby={`${challenge.challengeId}-survey-title`}>
              <div className="challenge-state-simulation__section-header">
                <div>
                  <h3 id={`${challenge.challengeId}-survey-title`}>{challenge.payload.survey.title}</h3>
                  <p>{t('challenge.stateSimulation.survey')}</p>
                </div>
                <span className="challenge-state-simulation__step">{t('challenge.stateSimulation.step', { current: Math.min(processedAttemptIndex + 1, 2), total: 2 })}</span>
              </div>

              <p className="challenge-state-simulation__question">{challenge.payload.survey.question}</p>

              <div className="challenge-state-simulation__options" role="radiogroup" aria-label={t('challenge.stateSimulation.voteOptions')}>
                {challenge.payload.survey.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedOptionId === option.id}
                    className="challenge-state-simulation__option"
                    data-selected={selectedOptionId === option.id ? 'true' : 'false'}
                    disabled={hasAcceptedVote}
                    onClick={() => setSelectedOptionId(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <dl className="challenge-state-simulation__masked-values">
                <div>
                  <dt>{challenge.payload.survey.identityLabel || t('challenge.stateSimulation.identity')}</dt>
                  <dd>{challenge.payload.survey.identityValue}</dd>
                </div>
                <div>
                  <dt>{challenge.payload.survey.nullifierLabel || t('challenge.stateSimulation.nullifier')}</dt>
                  <dd>{challenge.payload.survey.nullifierValue}</dd>
                </div>
              </dl>

              <div className="challenge-state-simulation__ledger" aria-label={t('challenge.stateSimulation.ledger')}>
                <div className="challenge-state-simulation__ledger-header">
                  <div>
                    <strong>{t('challenge.stateSimulation.ledger')}</strong>
                    <span>{challenge.payload.ledgerLabel}</span>
                  </div>
                  <span className="challenge-state-simulation__ledger-count">{ledgerEntries.length}</span>
                </div>
                {ledgerEntries.length > 0 ? (
                  <ul className="challenge-state-simulation__ledger-list">
                    {ledgerEntries.map((entry) => <li key={entry}>{entry}</li>)}
                  </ul>
                ) : <p className="challenge-state-simulation__empty-ledger">{t('challenge.stateSimulation.emptyLedger')}</p>}
              </div>

              {selectedOption ? (
                <p className="challenge-state-simulation__selected-vote">
                  <strong>{t('challenge.stateSimulation.selectedVote')}</strong> {selectedOption.label}
                </p>
              ) : null}

              {currentAttempt ? (
                <div className="challenge-state-simulation__attempt-context">
                  <strong>{currentAttempt.title}</strong>
                  <p>{currentAttempt.description}</p>
                </div>
              ) : null}

              <div className="challenge-state-simulation__actions">
                {processedAttemptIndex === 0 ? (
                  <Button onClick={processVote} disabled={!selectedOptionId}>{t('challenge.stateSimulation.submitVote')}</Button>
                ) : null}
                {processedAttemptIndex === 1 && hasAcceptedVote ? (
                  <Button onClick={processVote}>{t('challenge.stateSimulation.retryVote')}</Button>
                ) : null}
                {result === 'success' && onSuccessContinue ? (
                  <Button variant="primary" onClick={onSuccessContinue}>{t('common.continue')}</Button>
                ) : null}
                <Button variant="ghost" onClick={reset}>{t('challenge.stateSimulation.reset')}</Button>
              </div>
            </section>
          </Card>

          <Card>
            <section className="challenge-state-simulation__routine" aria-labelledby={`${challenge.challengeId}-routine-title`}>
              <div className="challenge-state-simulation__section-header">
                <div>
                  <h3 id={`${challenge.challengeId}-routine-title`}>{t('challenge.stateSimulation.routine')}</h3>
                  <p>{t('challenge.stateSimulation.routineHint')}</p>
                </div>
              </div>

              <div className="challenge-state-simulation__routine-lines" role="list" aria-label={t('challenge.stateSimulation.routine')}>
                {challenge.payload.routine.lines.map((line, index) => {
                  const state = getLineState(line.id)
                  const isActive = latestEvent?.activeLineId === line.id
                  return (
                    <div
                      key={line.id}
                      className="challenge-state-simulation__routine-line"
                      data-state={state}
                      data-active={isActive ? 'true' : 'false'}
                      role="listitem"
                      aria-label={t('challenge.stateSimulation.routineLine', { number: index + 1, code: line.code })}
                    >
                      <span className="challenge-state-simulation__line-number" aria-hidden="true">{index + 1}</span>
                      <code>{line.code}</code>
                    </div>
                  )
                })}
              </div>

              {latestEvent ? (
                <div className="challenge-state-simulation__routine-event" data-outcome={latestEvent.outcome}>
                  <strong>{latestEvent.title}</strong>
                  <span>{latestEvent.reason}</span>
                </div>
              ) : (
                <p className="challenge-state-simulation__empty-routine">{t('challenge.stateSimulation.emptyRoutine')}</p>
              )}
            </section>
          </Card>
        </div>

        <Card>
          <section className="challenge-state-simulation__history" aria-labelledby={`${challenge.challengeId}-history-title`}>
            <h3 id={`${challenge.challengeId}-history-title`}>{t('challenge.stateSimulation.eventHistory')}</h3>
            {eventHistory.length > 0 ? (
              <ol className="challenge-state-simulation__events">
                {eventHistory.map((event) => (
                  <li key={event.id} className="challenge-state-simulation__event" data-outcome={event.outcome}>
                    <div className="challenge-state-simulation__event-header">
                      <div>
                        <strong>{event.title}</strong>
                        <span className="challenge-state-simulation__event-outcome">{event.outcome === 'accepted' ? t('challenge.stateSimulation.accepted') : t('challenge.stateSimulation.rejected')}</span>
                      </div>
                      <span className="challenge-state-simulation__event-ledger">{event.ledgerEntry || t('challenge.stateSimulation.emptyLedger')}</span>
                    </div>
                    <p>{event.reason}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="challenge-state-simulation__empty-history">{t('challenge.stateSimulation.emptyHistory')}</p>}
            <ChallengeFeedback result={result} />
          </section>
        </Card>
      </div>
    </ChallengeShell>
  )
}

function CodeAssemblyChallenge({ challenge, onSuccess, onSuccessContinue }: { challenge: Extract<ChallengeDefinition, { type: 'code_assembly' }>; onSuccess: (exposureDelta: number) => void; onSuccessContinue?: () => void }) {
  const { t } = useTranslation('common')
  const [placedPieceIds, setPlacedPieceIds] = useState<Array<string | null>>(() => challenge.payload.slots.map(() => null))
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null)
  const [result, setResult] = useState<'success' | 'failure' | null>(null)
  const successNotified = useRef(false)
  const pieceById = useMemo(() => new Map(challenge.payload.pieces.map((piece) => [piece.id, piece])), [challenge.payload.pieces])
  const placedPieceSet = new Set(placedPieceIds.filter((pieceId): pieceId is string => pieceId !== null))
  const assemblyHintId = `${challenge.challengeId}-assembly-hint`

  const placePiece = (pieceId: string, slotIndex: number) => {
    if (successNotified.current) return
    setPlacedPieceIds((current) => current.map((currentPieceId, index) => {
      if (index === slotIndex) return pieceId
      return currentPieceId === pieceId ? null : currentPieceId
    }))
    setSelectedPieceId(null)
    setResult(null)
  }

  const removePiece = (slotIndex: number) => {
    if (successNotified.current) return
    setPlacedPieceIds((current) => current.map((pieceId, index) => (index === slotIndex ? null : pieceId)))
    setResult(null)
  }

  const onDrop = (event: React.DragEvent, slotIndex: number) => {
    event.preventDefault()
    const pieceId = event.dataTransfer.getData('pieceId')
    if (pieceId && pieceById.has(pieceId)) placePiece(pieceId, slotIndex)
  }

  const submit = () => {
    const isCorrect = placedPieceIds.length === challenge.payload.correctOrder.length
      && placedPieceIds.every((pieceId, index) => pieceId === challenge.payload.correctOrder[index])

    if (!isCorrect) {
      setResult('failure')
      return
    }

    setResult('success')
    if (!successNotified.current) {
      successNotified.current = true
      onSuccess(challenge.effects?.onSuccess?.increaseExposure ?? 0)
    }
  }

  const reset = () => {
    if (successNotified.current) return
    setPlacedPieceIds(challenge.payload.slots.map(() => null))
    setSelectedPieceId(null)
    setResult(null)
  }

  const previewTokens = challenge.payload.slots.map((_, slotIndex) => {
    const pieceId = placedPieceIds[slotIndex]
    return pieceId ? pieceById.get(pieceId)?.label ?? '' : ''
  })
  const assembledPreview = challenge.payload.slots.length === 4
    ? `${previewTokens[0] || '____'} ${previewTokens[1] || '____'}(${previewTokens[2] || '____'})${previewTokens[3] || '____'}`
    : challenge.payload.slots.map((_, slotIndex) => previewTokens[slotIndex] || '____').join('\n')

  return (
    <ChallengeShell title={challenge.title} instructions={challenge.instructions} narrativeIntro={challenge.narrativeIntro}>
      <div className="challenge-code-assembly">
        <p id={assemblyHintId} className="challenge-code-assembly__hint">{t('challenge.codeAssembly.slotHint')}</p>
        <div className="challenge-code-assembly__columns">
          <section className="challenge-code-assembly__toolbox" aria-labelledby={`${challenge.challengeId}-toolbox-title`}>
            <h3 id={`${challenge.challengeId}-toolbox-title`} className="challenge-code-assembly__heading">{t('challenge.codeAssembly.toolbox')}</h3>
            <p className="challenge-code-assembly__purpose">{t('challenge.codeAssembly.slotHint')}</p>
            <div className="challenge-code-assembly__pieces">
              {challenge.payload.pieces.map((piece) => {
                const isPlaced = placedPieceSet.has(piece.id)

                return (
                <button
                  key={piece.id}
                  type="button"
                  className="challenge-code-assembly__piece"
                  draggable={!successNotified.current && !isPlaced}
                  disabled={successNotified.current || isPlaced}
                  data-placed={isPlaced ? 'true' : 'false'}
                  aria-pressed={selectedPieceId === piece.id}
                  aria-label={piece.label}
                  aria-describedby={selectedPieceId === piece.id ? assemblyHintId : undefined}
                  onClick={() => setSelectedPieceId((current) => (current === piece.id ? null : piece.id))}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('pieceId', piece.id)
                    event.dataTransfer.effectAllowed = 'move'
                  }}
                >
                  <span className="challenge-code-assembly__piece-stud" aria-hidden="true" />
                  <span>{piece.label}</span>
                  {isPlaced && <span className="challenge-code-assembly__piece-check" aria-hidden="true">✓</span>}
                </button>
                )
              })}
            </div>
          </section>

          <section className="challenge-code-assembly__routine" aria-labelledby={`${challenge.challengeId}-routine-title`}>
            <h3 id={`${challenge.challengeId}-routine-title`} className="challenge-code-assembly__heading">{t('challenge.codeAssembly.routine')}</h3>
            <p className="challenge-code-assembly__objective">{t('challenge.codeAssembly.objective')}</p>
            <pre className="challenge-code-assembly__context" aria-label={challenge.title}><code>{challenge.payload.contextLines.join('\n')}</code></pre>
            <div className="challenge-code-assembly__slots" role="list" aria-label={t('challenge.codeAssembly.routine')}>
              {challenge.payload.slots.map((slot, slotIndex) => {
                const pieceId = placedPieceIds[slotIndex]
                const piece = pieceId ? pieceById.get(pieceId) : undefined
                const slotLabel = piece ? `${slot.label}: ${piece.label}` : `${slot.label}: ${t('challenge.codeAssembly.emptySlot')}`

                return (
                  <div key={slot.id} className="challenge-code-assembly__slot-card" role="listitem">
                    <div className="challenge-code-assembly__slot-info">
                      <span className="challenge-code-assembly__slot-index" aria-hidden="true">{slotIndex + 1}</span>
                      <span className="challenge-code-assembly__slot-label">{slot.label}</span>
                    </div>
                    <button
                      type="button"
                      className="challenge-code-assembly__slot"
                      disabled={successNotified.current}
                      data-filled={piece ? 'true' : 'false'}
                      aria-label={piece ? `${slotLabel}. ${t('challenge.codeAssembly.removePiece')}` : slotLabel}
                      aria-describedby={assemblyHintId}
                      title={piece ? t('challenge.codeAssembly.removePiece') : t('challenge.codeAssembly.emptySlot')}
                      onClick={() => {
                        if (selectedPieceId) placePiece(selectedPieceId, slotIndex)
                        else if (piece) removePiece(slotIndex)
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => onDrop(event, slotIndex)}
                    >
                      {piece?.label ?? t('challenge.codeAssembly.emptySlot')}
                    </button>
                  </div>
                )
              })}
            </div>
            <pre className="challenge-code-assembly__preview" aria-label={challenge.title}><code>{assembledPreview}</code></pre>
          </section>
        </div>

        {result === 'success' && challenge.payload.successMessage ? (
          <p className="challenge-code-assembly__success-message" role="status" style={{ color: '#86efac', fontWeight: 600 }}>
            {challenge.payload.successMessage}
          </p>
        ) : null}

        <div className="challenge-code-assembly__actions">
          <Button onClick={submit}>{t('challenge.codeAssembly.check')}</Button>
          <Button variant="ghost" onClick={reset} disabled={successNotified.current}>{t('challenge.codeAssembly.reset')}</Button>
          <ChallengeFeedback result={result} />
          {result === 'success' && onSuccessContinue ? (
            <Button variant="primary" onClick={onSuccessContinue}>{t('common.continue')}</Button>
          ) : null}
        </div>
      </div>
    </ChallengeShell>
  )
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
  const { t } = useTranslation('common')
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
        <Button onClick={submit} disabled={!selected}>{t('challenge.submit')}</Button>
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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const { t } = useTranslation('common')

  // Randomize items on first load and keep them stable
  const items = useMemo(() => {
    return [...challenge.payload.items].sort(() => Math.random() - 0.5)
  }, [challenge.payload.items])

  const zones = challenge.payload.zones

  const onDragStart = (event: React.DragEvent, itemId: string) => {
    event.dataTransfer.setData('itemId', itemId)
  }

  const assignItemToZone = (itemId: string, zoneId: string) => {
    setAssignments((prev) => ({ ...prev, [itemId]: zoneId }))
    setResult(null) // Clear result on change
    setSelectedItemId(null)
  }

  const onDrop = (event: React.DragEvent, zoneId: string) => {
    const itemId = event.dataTransfer.getData('itemId')
    if (itemId) {
      assignItemToZone(itemId, zoneId)
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
    setSelectedItemId((current) => (current === itemId ? null : current))
  }

  const reset = () => {
    setAssignments({})
    setResult(null)
    setSelectedItemId(null)
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
      <div className="challenge-drag-drop">
        <p className="challenge-touch-hint">{t('challenge.touchHint')}</p>
        <div className="challenge-drag-drop__columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, minHeight: 350 }}>
        {/* Items Column */}
        <div className="challenge-drag-drop__items-column" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                  className="challenge-drag-drop__item-card"
                  draggable={!isAssigned}
                  onDragStart={(e) => onDragStart(e, item.id)}
                  role="button"
                  tabIndex={isAssigned ? -1 : 0}
                  aria-pressed={selectedItemId === item.id}
                  aria-disabled={isAssigned}
                  onClick={() => {
                    if (!isAssigned) setSelectedItemId((current) => (current === item.id ? null : item.id))
                  }}
                  onKeyDown={(event) => {
                    if (!isAssigned && (event.key === 'Enter' || event.key === ' ')) {
                      event.preventDefault()
                      setSelectedItemId((current) => (current === item.id ? null : item.id))
                    }
                  }}
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
        <div className="challenge-drag-drop__zones-column" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {zones.map((zone) => {
            const isWitness = zone.id === 'witness'
            const assignedItems = Object.entries(assignments).filter(([_, zid]) => zid === zone.id)
            
            return (
              <div
                key={zone.id}
                className="challenge-drag-drop__zone"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, zone.id)}
                role="button"
                tabIndex={0}
                onClick={() => {
                  if (selectedItemId) assignItemToZone(selectedItemId, zone.id)
                }}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return
                  if (selectedItemId && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault()
                    assignItemToZone(selectedItemId, zone.id)
                  }
                }}
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
                          onClick={(event) => {
                            event.stopPropagation()
                            removeItem(iid)
                          }}
                          onKeyDown={(event) => event.stopPropagation()}
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
      </div>
    </ChallengeShell>
  )
}
