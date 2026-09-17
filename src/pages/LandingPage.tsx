import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/lib/constants/routes'
import { useAppStore } from '@/app/store/app-store'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  const { t } = useTranslation('common')
  const agent = useAppStore((state) => state.agent)

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: 32,
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 20%), radial-gradient(circle at bottom right, rgba(245,158,11,0.10), transparent 18%), #09090b',
      }}
    >
      <section
        style={{
          maxWidth: 980,
          width: '100%',
          padding: 40,
          borderRadius: 28,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'linear-gradient(180deg, rgba(17,17,17,0.96) 0%, rgba(10,10,10,0.98) 100%)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ color: '#a1a1aa', letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12, marginBottom: 12 }}>Midnight</div>
        <h1 style={{ fontSize: 52, lineHeight: 1.05, margin: '0 0 16px 0' }}>{t('landing.title')}</h1>
        <p style={{ fontSize: 20, color: '#e4e4e7', marginTop: 0 }}>{t('landing.subtitle')}</p>
        <p style={{ maxWidth: 760, lineHeight: 1.8, color: '#a1a1aa' }}>{t('landing.description')}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 26 }}>
          <Link to={agent ? ROUTES.dashboard : ROUTES.onboarding}>
            <Button>{t('common.start')}</Button>
          </Link>
          <Link to={ROUTES.settings}>
            <Button variant="secondary">Settings</Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
