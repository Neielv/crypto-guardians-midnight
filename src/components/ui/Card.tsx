import type { PropsWithChildren } from 'react'

export function Card({ children }: PropsWithChildren) {
  return (
    <section
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        background: 'linear-gradient(180deg, rgba(17,17,17,0.98) 0%, rgba(10,10,10,0.98) 100%)',
        padding: 20,
        boxShadow: '0 18px 48px rgba(0,0,0,0.28)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {children}
    </section>
  )
}
