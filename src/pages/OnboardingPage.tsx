import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/lib/constants/routes'
import { useAppStore } from '@/app/store/app-store'
import { generateAliasSuggestion } from '@/domains/agent/agent.model'
import { Button } from '@/components/ui/Button'

export default function OnboardingPage() {
  const { t } = useTranslation('common')
  const createAgent = useAppStore((state) => state.createAgent)
  const navigate = useNavigate()

  const [showIntro, setShowIntro] = React.useState(true)
  const [alias, setAlias] = React.useState('')
  const [error, setError] = React.useState('')

  const handleSuggest = () => {
    const suggestion = generateAliasSuggestion()
    setAlias(suggestion)
    setError('')
  }

  const validate = (value: string) => {
    if (!value.trim()) return t('onboarding.aliasErrorRequired')
    if (value.trim().length < 2) return t('onboarding.aliasErrorMinLength')
    return ''
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate(alias)
    if (validationError) {
      setError(validationError)
      return
    }
    createAgent({ alias: alias.trim() })
    navigate(ROUTES.briefing)
  }

  if (showIntro) {
    return (
      <main
        className="onboarding-page onboarding-page--intro"
        onClick={() => setShowIntro(false)}
        style={{ 
          minHeight: '100vh', 
          background: '#000', 
          display: 'grid', 
          placeItems: 'center', 
          cursor: 'pointer' 
        }}
      >
        <div className="onboarding-page__intro" style={{ textAlign: 'center', animation: 'fadeInOut 4s ease-in-out' }}>
          <h2 style={{ color: '#fff', fontSize: 24, fontWeight: 300, letterSpacing: '0.15em' }}>
            {t('onboarding.introMessage')}
          </h2>
          <p style={{ color: '#52525b', marginTop: 24, fontSize: 12, letterSpacing: '0.2em' }}>
            [ {t('onboarding.clickToContinue')} ]
          </p>
        </div>
        <style>{`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-5px); }
          }
        `}</style>
      </main>
    )
  }

  return (
    <main
      className="onboarding-page"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.08), transparent 40%), radial-gradient(circle at 30% 80%, rgba(56,189,248,0.06), transparent 35%), #050505',
        padding: 24,
      }}
    >
      <section className="onboarding-page__content" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            marginBottom: 12,
            color: '#f5f5f5',
            lineHeight: 1.2,
          }}
        >
          {t('onboarding.shadowTitle')}
        </h1>
        <p
          style={{
            fontSize: 16,
            color: '#a1a1aa',
            marginBottom: 40,
            lineHeight: 1.6,
          }}
        >
          {t('onboarding.shadowSubtitle')}
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <div className="onboarding-page__input-area" style={{ textAlign: 'left' }}>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                color: '#71717a',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 600,
              }}
            >
              {t('onboarding.aliasLabel')}
            </label>
            <input
              type="text"
              value={alias}
              onChange={(e) => {
                setAlias(e.target.value)
                if (error) setError('')
              }}
              placeholder={t('onboarding.aliasPlaceholder')}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: error
                  ? '1px solid #ef4444'
                  : '1px solid #27272a',
                background: 'rgba(255,255,255,0.04)',
                color: '#f5f5f5',
                fontSize: 16,
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
            />
            {error && (
              <p style={{ color: '#ef4444', marginTop: 6, fontSize: 13 }}>
                {error}
              </p>
            )}
          </div>

          <div className="onboarding-page__actions" style={{ display: 'flex', gap: 12 }}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSuggest}
              style={{ flex: 1 }}
            >
              {t('onboarding.suggestAlias')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ flex: 2 }}
            >
              {t('onboarding.enterMission')}
            </Button>
          </div>
        </form>

        <button
          type="button"
          onClick={() => navigate(ROUTES.landing)}
          style={{
            marginTop: 28,
            background: 'transparent',
            border: 'none',
            color: '#52525b',
            fontSize: 13,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          {t('onboarding.backToLanding')}
        </button>
      </section>
    </main>
  )
}
