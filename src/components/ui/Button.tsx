import type { ButtonHTMLAttributes, CSSProperties, PropsWithChildren } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

type Props = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> & {
  variant?: Variant
}

const styles: Record<Variant, CSSProperties> = {
  primary: {
    background: 'linear-gradient(135deg, #fafafa 0%, #d4d4d8 100%)',
    color: '#09090b',
    border: '1px solid rgba(255,255,255,0.65)',
    boxShadow: '0 10px 24px rgba(255,255,255,0.08)',
  },
  secondary: {
    background: 'linear-gradient(135deg, rgba(24,24,27,0.98) 0%, rgba(39,39,42,0.92) 100%)',
    color: '#f5f5f5',
    border: '1px solid #27272a',
  },
  ghost: { background: 'transparent', color: '#f5f5f5', border: '1px solid rgba(255,255,255,0.08)' },
}

export function Button({ children, variant = 'primary', style, ...props }: Props) {
  return (
    <button
      {...props}
      style={{
        padding: '10px 14px',
        borderRadius: 12,
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        fontWeight: 600,
        transition: 'transform 0.15s ease, opacity 0.15s ease, border-color 0.15s ease',
        opacity: props.disabled ? 0.55 : 1,
        ...styles[variant],
        ...style,
      }}
    >
      {children}
    </button>
  )
}
