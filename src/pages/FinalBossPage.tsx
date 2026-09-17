import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/app/store/app-store'
import { loadLearningContent } from '@/domains/learning/content-loader'
import { getChallengeById } from '@/domains/learning/content-resolver'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ChallengeRunner } from '@/features/challenge-runner/ChallengeRunner'
import { ROUTES } from '@/lib/constants/routes'

const FINAL_CHALLENGE_ID = 'final-boss-challenge-1'

export default function FinalBossPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const locale = useAppStore((state) => state.locale)
  const content = useAppStore((state) => state.content)
  const bootstrapContent = useAppStore((state) => state.bootstrapContent)
  const bootstrapProgress = useAppStore((state) => state.bootstrapProgress)
  const markChallengeCompleted = useAppStore((state) => state.markChallengeCompleted)
  const increaseExposure = useAppStore((state) => state.increaseExposure)
  const completeFinalBoss = useAppStore((state) => state.completeFinalBoss)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const successHandled = useRef(false)

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    setLoadError(null)

    void loadLearningContent(locale).then((result) => {
      if (!isMounted) return

      if (result.ok) {
        bootstrapContent(result.data)
        bootstrapProgress()
        setIsLoading(false)
        return
      }

      setLoadError(result.errors.map((error) => error.message).join(' | '))
      setIsLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [bootstrapContent, bootstrapProgress, locale])

  const challenge = content ? getChallengeById(content, FINAL_CHALLENGE_ID) : null

  const handleSuccess = (exposureDelta: number) => {
    if (successHandled.current || !challenge) return
    successHandled.current = true
    markChallengeCompleted(challenge.challengeId)
    if (exposureDelta > 0) increaseExposure(exposureDelta)
  }

  const handleContinue = () => {
    if (!successHandled.current) return
    completeFinalBoss('midnight-guardian')
    navigate(ROUTES.results, { replace: true })
  }

  return (
    <AppShell>
      <div className="final-boss-page" style={{ maxWidth: 1040, display: 'grid', gap: 16 }}>
        {isLoading || content === null ? (
          <Card>
            <h1 style={{ marginTop: 0 }}>{t('finalBoss.loadingTitle')}</h1>
            <p style={{ marginBottom: 0, color: '#d4d4d8' }}>{t('finalBoss.loadingDescription')}</p>
          </Card>
        ) : null}

        {!isLoading && loadError ? (
          <Card>
            <h1 style={{ marginTop: 0 }}>{t('finalBoss.loadErrorTitle')}</h1>
            <p style={{ color: '#fca5a5', lineHeight: 1.6 }}>{t('finalBoss.loadErrorDescription')}</p>
            <p style={{ color: '#a1a1aa', fontSize: 13 }}>{loadError}</p>
            <Link to={ROUTES.dashboard} style={{ textDecoration: 'none' }}><Button variant="secondary">{t('navigation.backToDashboard')}</Button></Link>
          </Card>
        ) : null}

        {!isLoading && !loadError && content !== null && !challenge ? (
          <Card>
            <h1 style={{ marginTop: 0 }}>{t('finalBoss.unavailableTitle')}</h1>
            <p style={{ color: '#d4d4d8', lineHeight: 1.7 }}>{t('finalBoss.unavailableDescription')}</p>
            <Link to={ROUTES.dashboard} style={{ textDecoration: 'none' }}><Button variant="secondary">{t('navigation.backToDashboard')}</Button></Link>
          </Card>
        ) : null}

        {!isLoading && !loadError && challenge ? (
          <>
            <section className="final-boss-page__intro">
              <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('finalBoss.eyebrow')}</div>
              <h1 style={{ margin: '0 0 10px', fontSize: 38 }}>{t('finalBoss.title')}</h1>
              <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.7 }}>{t('finalBoss.description')}</p>
              <p style={{ color: '#86efac', lineHeight: 1.7, marginBottom: 0 }}>{t('finalBoss.mission')}</p>
            </section>
            <ChallengeRunner challenge={challenge} onSuccess={handleSuccess} onSuccessContinue={handleContinue} />
          </>
        ) : null}
      </div>
    </AppShell>
  )
}
