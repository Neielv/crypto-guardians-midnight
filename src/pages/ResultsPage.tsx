import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/app/store/app-store'
import { loadLearningContent } from '@/domains/learning/content-loader'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants/routes'

const OFFICIAL_EXAMPLES_HUB_URL = 'https://github.com/midnightntwrk/midnight-awesome-dapps'

const NEXT_LEARNING_RESOURCES = [
  {
    key: 'counter',
    url: 'https://github.com/midnightntwrk/example-counter',
  },
  {
    key: 'bboard',
    url: 'https://github.com/midnightntwrk/example-bboard',
  },
  {
    key: 'zkLoan',
    url: 'https://github.com/midnightntwrk/example-zkloan',
  },
] as const

export default function ResultsPage() {
  const { t } = useTranslation('common')
  const locale = useAppStore((state) => state.locale)
  const content = useAppStore((state) => state.content)
  const progress = useAppStore((state) => state.progress)
  const agent = useAppStore((state) => state.agent)
  const exposure = useAppStore((state) => state.exposure)
  const bootstrapContent = useAppStore((state) => state.bootstrapContent)
  const bootstrapProgress = useAppStore((state) => state.bootstrapProgress)
  const [isLoading, setIsLoading] = useState(content === null || Object.keys(progress.modules).length === 0)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (content !== null && Object.keys(progress.modules).length > 0) {
      setIsLoading(false)
      return
    }

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
  }, [bootstrapContent, bootstrapProgress, content, locale, progress.modules])

  const completedModuleCount = useMemo(
    () => content?.modules.filter((module) => progress.modules[module.moduleId]?.status === 'completed').length ?? 0,
    [content, progress.modules],
  )
  const finalBadge = progress.finalBadge === 'midnight-guardian'
    ? t('results.badges.midnightGuardian')
    : progress.finalBadge ?? t('results.badges.pending')

  return (
    <AppShell>
      <div className="results-page" style={{ maxWidth: 1040, display: 'grid', gap: 16 }}>
        {isLoading ? (
          <Card>
            <h1 style={{ marginTop: 0 }}>{t('results.loadingTitle')}</h1>
            <p style={{ marginBottom: 0, color: '#d4d4d8' }}>{t('results.loadingDescription')}</p>
          </Card>
        ) : null}

        {!isLoading && loadError ? (
          <Card>
            <h1 style={{ marginTop: 0 }}>{t('results.loadErrorTitle')}</h1>
            <p style={{ color: '#fca5a5', lineHeight: 1.6 }}>{t('results.loadErrorDescription')}</p>
            <p style={{ color: '#a1a1aa', fontSize: 13 }}>{loadError}</p>
            <Link to={ROUTES.dashboard} style={{ textDecoration: 'none' }}><Button variant="secondary">{t('navigation.backToDashboard')}</Button></Link>
          </Card>
        ) : null}

        {!isLoading && !loadError ? (
          <>
            <section className="results-page__hero">
              <div style={{ color: '#86efac', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('results.eyebrow')}</div>
              <h1 style={{ margin: '0 0 10px', fontSize: 38 }}>{t('results.title')}</h1>
              <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.7 }}>{t('results.description', { alias: agent?.witness.alias ?? t('results.unknownAgent') })}</p>
            </section>

            <section className="results-page__stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              <Card><div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('results.stats.agentAlias')}</div><strong style={{ fontSize: 24 }}>{agent?.witness.alias ?? t('results.unknownAgent')}</strong></Card>
              <Card><div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('results.stats.modules')}</div><strong style={{ fontSize: 24 }}>{completedModuleCount} / {content?.modules.length ?? 0}</strong></Card>
              <Card><div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('results.stats.challenges')}</div><strong style={{ fontSize: 24 }}>{progress.completedChallengeIds.length}</strong></Card>
              <Card><div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('results.stats.exposureLevel')}</div><strong style={{ fontSize: 24 }}>{t(`results.exposureLevels.${exposure.level}`)}</strong></Card>
              <Card><div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('results.stats.exposureScore')}</div><strong style={{ fontSize: 24 }}>{exposure.score}</strong></Card>
              <Card><div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('results.stats.finalBadge')}</div><strong style={{ fontSize: 24 }}>{finalBadge}</strong></Card>
            </section>

            <section className="results-page__closing">
              <div style={{ color: '#86efac', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('results.closing.eyebrow')}</div>
              <h2 style={{ margin: '0 0 10px', fontSize: 30 }}>{t('results.closing.title')}</h2>
              <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.7 }}>{t('results.closing.description')}</p>
            </section>

            <section className="results-page__next-steps" style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ color: '#86efac', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('results.nextSteps.eyebrow')}</div>
                <h2 style={{ margin: '0 0 10px', fontSize: 30 }}>{t('results.nextSteps.title')}</h2>
                <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.7 }}>{t('results.nextSteps.description')}</p>
              </div>

              <div className="results-page__resources" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                {NEXT_LEARNING_RESOURCES.map((resource) => (
                  <Card key={resource.key}>
                    <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t(`results.nextSteps.resources.${resource.key}.level`)}</div>
                    <h3 style={{ margin: '0 0 10px', fontSize: 21 }}>{t(`results.nextSteps.resources.${resource.key}.title`)}</h3>
                    <p style={{ margin: '0 0 18px', color: '#d4d4d8', lineHeight: 1.6 }}>{t(`results.nextSteps.resources.${resource.key}.description`)}</p>
                    <a href={resource.url} target="_blank" rel="noopener noreferrer" style={{ color: '#86efac', fontWeight: 600 }}>{t(`results.nextSteps.resources.${resource.key}.linkLabel`)}</a>
                  </Card>
                ))}
              </div>

              <Card>
                <div style={{ color: '#86efac', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('results.nextSteps.officialHub.label')}</div>
                <h3 style={{ margin: '0 0 10px', fontSize: 21 }}>{t('results.nextSteps.officialHub.title')}</h3>
                <p style={{ margin: '0 0 18px', color: '#d4d4d8', lineHeight: 1.6 }}>{t('results.nextSteps.officialHub.description')}</p>
                <a href={OFFICIAL_EXAMPLES_HUB_URL} target="_blank" rel="noopener noreferrer" style={{ color: '#86efac', fontWeight: 600 }}>{t('results.nextSteps.officialHub.linkLabel')}</a>
              </Card>
            </section>

            <Link to={ROUTES.dashboard} style={{ textDecoration: 'none', justifySelf: 'start' }}><Button>{t('results.backToDashboard')}</Button></Link>
          </>
        ) : null}
      </div>
    </AppShell>
  )
}
