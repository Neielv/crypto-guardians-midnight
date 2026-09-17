import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/app/store/app-store'
import { AppShell } from '@/components/layout/AppShell'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants/routes'

export default function SettingsPage() {
  const { t } = useTranslation('common')
  const locale = useAppStore((state) => state.locale)
  const setLocale = useAppStore((state) => state.setLocale)
  const isAgent = useAppStore((state) => state.agent !== null)

  return (
    <AppShell>
      <div style={{ maxWidth: 760 }}>
        <section
          style={{
            marginBottom: 24,
            padding: 24,
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(17,17,17,0.98) 0%, rgba(11,18,25,0.98) 60%, rgba(10,10,10,0.98) 100%)',
          }}
        >
          <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>{t('settings.sectionEyebrow')}</div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: 38 }}>{t('settings.title')}</h1>
          <p style={{ margin: 0, color: '#d4d4d8', lineHeight: 1.7 }}>{t('settings.description')}</p>
        </section>

        <Card>
          <h2 style={{ marginTop: 0 }}>{t('settings.languageTitle')}</h2>
          <p style={{ color: '#d4d4d8' }}>{t('settings.currentLanguage', { locale: locale.toUpperCase() })}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant={locale === 'es' ? 'primary' : 'secondary'} onClick={() => setLocale('es')}>Español</Button>
            <Button variant={locale === 'en' ? 'primary' : 'secondary'} onClick={() => setLocale('en')}>English</Button>
          </div>
          <div style={{ marginTop: 20 }}>
            {isAgent ? (
              <Link to={ROUTES.dashboard}>
                <Button variant="secondary">{t('navigation.backToDashboard')}</Button>
              </Link>
            ) : (
              <Link to={ROUTES.landing}>
                <Button variant="secondary">{t('onboarding.backToLanding')}</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}
