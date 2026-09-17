import type { PropsWithChildren } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/Card'

export function ChallengeShell({ title, instructions, narrativeIntro, children }: PropsWithChildren<{ title: string; instructions: string; narrativeIntro?: string }>) {
  const { t } = useTranslation('common')

  return (
    <Card>
      <div style={{ marginBottom: 18 }}>
        <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{t('challenge.interactiveStep')}</div>
        <h2 style={{ margin: 0, fontSize: 28 }}>{title}</h2>
      </div>
      {narrativeIntro ? (
        <p style={{ color: '#86efac', lineHeight: 1.7, fontStyle: 'italic', marginTop: 0, marginBottom: 12 }}>{narrativeIntro}</p>
      ) : null}
      <p style={{ color: '#d4d4d8', lineHeight: 1.7 }}>{instructions}</p>
      <div style={{ marginTop: 16 }}>{children}</div>
    </Card>
  )
}
