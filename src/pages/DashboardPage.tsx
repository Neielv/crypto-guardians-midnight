import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loadLearningContent } from '@/domains/learning/content-loader'
import { useAppStore } from '@/app/store/app-store'
import { selectModuleStatus } from '@/app/store/selectors'
import { ROUTES } from '@/lib/constants/routes'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'

export default function DashboardPage() {
  const { t } = useTranslation('common')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  // Get the entire app state
  const appState = useAppStore((state) => state)
  const locale = appState.locale
  const bootstrapContent = appState.bootstrapContent
  const bootstrapProgress = appState.bootstrapProgress
  const content = appState.content
  const progress = appState.progress

  const moduleStatuses = useMemo(() => {
    return Object.fromEntries(
      (content?.modules ?? []).map((module) => [
        module.moduleId,
        {
          status: selectModuleStatus(appState, module.moduleId),
        },
      ]),
    )
  }, [content, progress])

  const dashboardStats = useMemo(() => {
    const modules = content?.modules ?? []
    const statuses = Object.values(progress.modules)
    const availableCount = statuses.filter((module) => module.status === 'available').length
    const lockedCount = statuses.filter((module) => module.status === 'locked').length
    const completedCount = statuses.filter((module) => module.status === 'completed').length
    const activeModule = modules.find((module) => module.moduleId === progress.currentModuleId) ?? null

    return {
      totalCount: modules.length,
      availableCount,
      lockedCount,
      completedCount,
      activeModule,
    }
  }, [content, progress.currentModuleId, progress.modules])

  useEffect(() => {
    setIsLoading(true)
    setLoadError(null)

    void loadLearningContent(locale).then((result) => {
      if (result.ok) {
        bootstrapContent(result.data)
        bootstrapProgress()
        setIsLoading(false)
        return
      }

      setLoadError(result.errors.map((error) => error.message).join(' | '))
      setIsLoading(false)
    })
  }, [bootstrapContent, bootstrapProgress, locale])

  return (
    <AppShell>
      <div className="dashboard-page" style={{ maxWidth: 1040 }}>
        <section
          className="dashboard-page__hero"
          style={{
            marginBottom: 24,
            padding: 24,
            borderRadius: 24,
            border: '1px solid rgba(139,92,246,0.18)',
            background: 'linear-gradient(135deg, rgba(17,17,17,0.98) 0%, rgba(18,12,28,0.98) 50%, rgba(10,10,10,0.98) 100%)',
            boxShadow: '0 8px 32px rgba(139,92,246,0.08)',
          }}
        >
          <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('dashboard.eyebrow')}</div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: 38, textShadow: '0 0 24px rgba(139,92,246,0.22)' }}>{t('dashboard.title')}</h1>
          <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.7 }}>{t('dashboard.description')}</p>
        </section>

        <section className="dashboard-page__stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
          <Card>
            <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('dashboard.stats.totalModules')}</div>
            <strong style={{ fontSize: 30 }}>{dashboardStats.totalCount}</strong>
          </Card>
          <Card>
            <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('dashboard.stats.availableModules')}</div>
            <strong style={{ fontSize: 30 }}>{dashboardStats.availableCount}</strong>
          </Card>
          <Card>
            <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('dashboard.stats.lockedModules')}</div>
            <strong style={{ fontSize: 30 }}>{dashboardStats.lockedCount}</strong>
          </Card>
          <Card>
            <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('dashboard.stats.completedModules')}</div>
            <strong style={{ fontSize: 30 }}>{dashboardStats.completedCount}</strong>
          </Card>
          <Card>
            <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('dashboard.stats.activeModule')}</div>
            <strong style={{ fontSize: 20 }}>{dashboardStats.activeModule?.narrativeTitle ?? dashboardStats.activeModule?.title ?? t('dashboard.stats.noActiveModule')}</strong>
          </Card>
        </section>

        <div className="dashboard-page__content" style={{ display: 'grid', gap: 16 }}>
          {isLoading ? (
            <Card>
              <h2 style={{ marginTop: 0 }}>{t('dashboard.loadingTitle')}</h2>
              <p style={{ marginBottom: 0, color: '#d4d4d8' }}>{t('dashboard.loadingDescription')}</p>
            </Card>
          ) : null}

          {!isLoading && loadError ? (
            <Card>
              <h2 style={{ marginTop: 0 }}>{t('dashboard.loadErrorTitle')}</h2>
              <p style={{ color: '#fca5a5', lineHeight: 1.6 }}>{loadError}</p>
            </Card>
          ) : null}

          {!isLoading && !loadError && (content?.modules ?? []).length === 0 ? (
            <Card>
              <h2 style={{ marginTop: 0 }}>{t('dashboard.emptyTitle')}</h2>
              <p style={{ marginBottom: 0, color: '#d4d4d8' }}>{t('dashboard.emptyDescription')}</p>
            </Card>
          ) : null}

          <div className="dashboard-page__modules" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16 }}>
          {(content?.modules ?? []).map((module) => {
              const moduleUiState = moduleStatuses[module.moduleId] ?? {
                status: 'locked',
              }
              const isImplemented = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'].includes(module.moduleId)
              const canOpen = isImplemented && (moduleUiState.status === 'available' || moduleUiState.status === 'completed')
              const isActive = progress.currentModuleId === module.moduleId
              const statusIcon = canOpen ? '🔓' : '🔒'
              const statusIconLabel = canOpen ? t('status.available') : t('status.locked')

              const contentNode = (
                <Card>
                  <div
                    className="dashboard-page__module-card"
                    style={{
                      minHeight: 220,
                      aspectRatio: '1 / 1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 16,
                      opacity: canOpen ? 1 : 0.88,
                    }}
                  >
                    <div className="dashboard-page__module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                      <div className="dashboard-page__module-heading">
                        <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{module.moduleId.toUpperCase()}</div>
                        <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.15, textShadow: isActive ? '0 0 16px rgba(139,92,246,0.35)' : undefined }}>{module.narrativeTitle ?? module.title}</h2>
                      </div>
                      <div
                        aria-label={statusIconLabel}
                        title={statusIconLabel}
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 999,
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: 20,
                          background: canOpen ? 'rgba(34,197,94,0.14)' : 'rgba(255,255,255,0.06)',
                          border: canOpen ? '1px solid rgba(34,197,94,0.28)' : '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {statusIcon}
                      </div>
                    </div>

                    <p className="dashboard-page__module-description" style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.6, fontSize: 14 }}>
                      {module.dramaticDescription ?? module.summary}
                    </p>

                    <div className="dashboard-page__module-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', gap: 12 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {module.concepts.slice(0, 2).map((concept) => (
                          <span
                            key={concept}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              borderRadius: 999,
                              padding: '5px 10px',
                              fontSize: 12,
                              color: '#d4d4d8',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            {concept}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {isActive ? (
                          <span
                            title={t('status.active')}
                            aria-label={t('status.active')}
                            style={{
                              width: 12,
                              height: 12,
                              borderRadius: 999,
                              background: '#22c55e',
                              boxShadow: '0 0 0 6px rgba(34,197,94,0.16)',
                              flexShrink: 0,
                            }}
                          />
                        ) : null}

                        {!isImplemented ? (
                          <span style={{ color: '#fcd34d', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {t('dashboard.comingSoon')}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              )

              return canOpen ? (
                <Link
                  key={module.moduleId}
                  to={`/modules/${module.moduleId}`}
                  className="dashboard-page__module-link"
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  {contentNode}
                </Link>
              ) : (
                <div className="dashboard-page__module-wrapper" key={module.moduleId}>{contentNode}</div>
              )
            })}
          </div>
        </div>

        <p style={{ marginTop: 20 }}><Link to={ROUTES.settings}>{t('navigation.settings')}</Link></p>
      </div>
    </AppShell>
  )
}
