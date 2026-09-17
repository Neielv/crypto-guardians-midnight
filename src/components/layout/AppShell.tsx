import { useState, type PropsWithChildren, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/app/store/app-store'
import { ROUTES } from '@/lib/constants/routes'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import packageJson from '../../../package.json'

type AppShellProps = PropsWithChildren<{
  sidebar?: ReactNode
  sidebarWidth?: number
}>

export function AppShell({ children, sidebar, sidebarWidth = 250 }: AppShellProps) {
  const { t } = useTranslation('common')
  const locale = useAppStore((state) => state.locale)
  const setLocale = useAppStore((state) => state.setLocale)
  const exposure = useAppStore((state) => state.exposure)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const tone = exposure.level === 'high' ? 'danger' : exposure.level === 'medium' ? 'warning' : 'success'
  const closeMobileNav = () => setMobileNavOpen(false)
  const mobileMenuLabel = t(mobileNavOpen ? 'navigation.closeMenu' : 'navigation.openMenu')

  return (
    <div
      className="app-shell"
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: `${sidebarWidth}px 1fr`,
        background:
          'radial-gradient(circle at top left, rgba(56,189,248,0.12), transparent 22%), radial-gradient(circle at bottom right, rgba(245,158,11,0.10), transparent 18%), #09090b',
      }}
    >
      {mobileNavOpen ? <button type="button" className="app-shell__backdrop" aria-label={t('navigation.closeMenu')} onClick={closeMobileNav} /> : null}
      {sidebar ? (
        <div
          id="app-shell-sidebar"
          className={`app-shell__sidebar${mobileNavOpen ? ' app-shell__sidebar--open' : ''}`}
          onClick={closeMobileNav}
          style={{ padding: 24, borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(10,10,10,0.86)', backdropFilter: 'blur(10px)' }}
        >
          {sidebar}
        </div>
      ) : (
        <aside
          id="app-shell-sidebar"
          className={`app-shell__sidebar${mobileNavOpen ? ' app-shell__sidebar--open' : ''}`}
          onClick={closeMobileNav}
          style={{
            borderRight: '1px solid rgba(255,255,255,0.08)',
            padding: 24,
            background: 'rgba(10,10,10,0.86)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: '#a1a1aa', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>{t('shell.demoLabel')}</div>
            <h2 style={{ margin: 0, fontSize: 24 }}>CryptoGuardians</h2>
            <p style={{ marginBottom: 0, color: '#a1a1aa', lineHeight: 1.5 }}>{t('shell.description')}</p>
          </div>
          <nav style={{ display: 'grid', gap: 10 }}>
            <ShellLink to={ROUTES.dashboard}>{t('navigation.dashboard')}</ShellLink>
            <ShellLink to={ROUTES.settings}>{t('navigation.settings')}</ShellLink>
            <ShellLink to={ROUTES.finalBoss}>{t('navigation.finalBoss')}</ShellLink>
          </nav>
          <div style={{ marginTop: 28, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('shell.threatLevel')}</div>
            <Badge tone={tone}>{t('shell.exposureLabel', { level: exposure.level, score: exposure.score })}</Badge>
          </div>
        </aside>
      )}
      <div className="app-shell__content">
        <header
          className="app-shell__header"
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(10,10,10,0.55)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div className="app-shell__header-copy">
            <div style={{ fontSize: 12, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{t('shell.headerEyebrow')}</div>
            <div style={{ marginTop: 6, fontWeight: 700 }}>{t('shell.headerTitle')}</div>
          </div>
          <div className="app-shell__header-controls" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Button
              type="button"
              className="app-shell__menu-button"
              variant="secondary"
              aria-expanded={mobileNavOpen}
              aria-controls="app-shell-sidebar"
              aria-label={mobileMenuLabel}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? '×' : '☰'}
            </Button>
            <Badge tone={tone}>{exposure.level}</Badge>
            <Button variant={locale === 'es' ? 'primary' : 'secondary'} onClick={() => setLocale('es')}>ES</Button>
            <Button variant={locale === 'en' ? 'primary' : 'secondary'} onClick={() => setLocale('en')}>EN</Button>
          </div>
         </header>
         <main className="app-shell__main" style={{ padding: 28 }}>{children}</main>
         <footer className="app-shell__footer" aria-label={t('shell.footerLabel')}>
           {t('shell.version', { version: packageJson.version })}
         </footer>
       </div>
    </div>
  )
}

function ShellLink({ to, children }: PropsWithChildren<{ to: string }>) {
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        padding: '12px 14px',
        borderRadius: 14,
        color: '#e4e4e7',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {children}
    </Link>
  )
}
