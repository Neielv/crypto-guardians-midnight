import type { PropsWithChildren } from 'react'

type Tone = 'neutral' | 'success' | 'warning' | 'danger'

const toneStyles: Record<Tone, React.CSSProperties> = {
  neutral: { background: '#18181b', color: '#d4d4d8' },
  success: { background: '#052e16', color: '#86efac' },
  warning: { background: '#451a03', color: '#fcd34d' },
  danger: { background: '#450a0a', color: '#fca5a5' },
}

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: Tone }>) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: 12,
        ...toneStyles[tone],
      }}
    >
      {children}
    </span>
  )
}
