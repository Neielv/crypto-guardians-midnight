import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SlideDefinition, SupportMaterialDefinition } from '@/domains/learning/learning.types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type Props = {
  slide: SlideDefinition
  supportMaterials: SupportMaterialDefinition[]
  current: number
  total: number
  canGoBack: boolean
  canGoNext: boolean
  onBack: () => void
  onNext: () => void
  isLast: boolean
}

export function SlideViewer({ slide, supportMaterials, current, total, canGoBack, canGoNext, onBack, onNext, isLast }: Props) {
  const { t } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<'slide' | 'support'>('slide')
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    setActiveTab('slide')
    setImageError(false)
  }, [slide.slideId])

  return (
    <Card>
      <div className="slide-viewer__tabs" style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
        <button
          className="slide-viewer__tab"
          onClick={() => setActiveTab('slide')}
          style={{
            borderRadius: 999,
            border: activeTab === 'slide' ? '1px solid rgba(56,189,248,0.45)' : '1px solid rgba(255,255,255,0.08)',
            background: activeTab === 'slide' ? 'rgba(56,189,248,0.14)' : 'rgba(255,255,255,0.03)',
            color: '#f5f5f5',
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          {t('slide.tabs.lesson')}
        </button>
        <button
          className="slide-viewer__tab"
          onClick={() => setActiveTab('support')}
          style={{
            borderRadius: 999,
            border: activeTab === 'support' ? '1px solid rgba(245,158,11,0.45)' : '1px solid rgba(255,255,255,0.08)',
            background: activeTab === 'support' ? 'rgba(245,158,11,0.14)' : 'rgba(255,255,255,0.03)',
            color: '#f5f5f5',
            padding: '8px 14px',
            cursor: 'pointer',
          }}
        >
          {t('slide.tabs.support')}
        </button>
      </div>

      {activeTab === 'support' ? (
        <div className="slide-viewer__support-list" style={{ display: 'grid', gap: 16 }}>
          {supportMaterials.length > 0 ? supportMaterials.map((item) => (
            <section
              key={item.supportMaterialId}
              className="slide-viewer__support-card"
              style={{
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'linear-gradient(180deg, rgba(17,17,17,0.96) 0%, rgba(10,10,10,0.98) 100%)',
                padding: 20,
              }}
            >
              <div style={{ color: '#f59e0b', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                {item.sourceChapter} · {item.sourceSection}
              </div>
              <h3 style={{ marginTop: 0 }}>{item.title}</h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {item.excerpts.map((excerpt) => (
                  <p key={excerpt} style={{ margin: 0, color: '#e4e4e7', lineHeight: 1.7 }}>{excerpt}</p>
                ))}
                {item.codeBlocks?.map((block) => (
                  <div className="slide-viewer__code-block" key={`${item.supportMaterialId}-${block.title}`} style={{ display: 'grid', gap: 8, marginTop: 4 }}>
                    <div style={{ color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{block.title}</div>
                    <pre className="slide-viewer__code" style={{ margin: 0, background: '#0a0a0a', padding: 16, borderRadius: 16, overflowX: 'auto', border: '1px solid rgba(255,255,255,0.06)', color: '#f5f5f5' }}><code>{block.code}</code></pre>
                  </div>
                ))}
              </div>
            </section>
          )) : (
            <p style={{ margin: 0, color: '#d4d4d8' }}>{t('slide.supportEmpty')}</p>
          )}
        </div>
      ) : (
        <>
      <div className="slide-viewer__progress" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 18 }}>
        <div style={{ color: '#a1a1aa', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('slide.progressLabel', { current, total })}</div>
        <div className="slide-viewer__progress-bar" style={{ width: 140, height: 8, borderRadius: 999, background: '#18181b', overflow: 'hidden' }}>
          <div style={{ width: `${(current / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #f8fafc)' }} />
        </div>
      </div>
      <div
        className="slide-viewer__viewport"
        style={{
          minHeight: 340,
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'radial-gradient(circle at top left, rgba(56,189,248,0.16), transparent 28%), linear-gradient(180deg, rgba(17,17,17,0.95) 0%, rgba(10,10,10,0.98) 100%)',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: slide.image ? 'flex-end' : 'center',
          marginBottom: 20,
        }}
      >
        {/* Navigation Arrows */}
        {canGoBack && (
          <button
            className="slide-viewer__arrow slide-viewer__arrow--back"
            onClick={onBack}
            style={{
              position: 'absolute',
              left: 16,
              top: '40%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              width: 44,
              height: 44,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}

        {canGoNext && (
          <button
            className="slide-viewer__arrow slide-viewer__arrow--next"
            onClick={onNext}
            style={{
              position: 'absolute',
              right: 16,
              top: '40%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              width: 44,
              height: 44,
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        )}

        {(slide.image && !imageError) ? (
          <>
            <img 
              className="slide-viewer__image"
              src={`${import.meta.env.BASE_URL}${slide.image}`} 
              alt={slide.title} 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} 
              onError={() => setImageError(true)}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)', zIndex: 1 }} />
            
            <div className="slide-viewer__slide-content" style={{
              position: 'relative',
              zIndex: 2,
              background: 'rgba(10, 10, 10, 0.15)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '24px 32px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <h2 style={{ fontSize: 26, margin: '0 0 8px 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{slide.title}</h2>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: '#e4e4e7', margin: 0, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>{slide.text}</p>
            </div>
          </>
        ) : (
          <div className="slide-viewer__placeholder" style={{ padding: 32, textAlign: 'center', zIndex: 2 }}>
            <div style={{ maxWidth: 520, margin: '0 auto', marginBottom: 24 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7dd3fc', marginBottom: 12 }}>{t('slide.visualPlaceholderTitle')}</div>
              <div style={{ fontSize: 18, lineHeight: 1.6, color: '#e4e4e7' }}>{slide.visualHint ?? t('slide.visualPlaceholderFallback')}</div>
            </div>
            <h2 style={{ fontSize: 26, margin: '0 0 8px 0' }}>{slide.title}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: '#e4e4e7', margin: 0 }}>{slide.text}</p>
          </div>
        )}
      </div>
        </>
      )}
      <div className="slide-viewer__navigation" style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <Button variant="secondary" disabled={!canGoBack} onClick={onBack}>{t('slide.previous')}</Button>
        <Button disabled={!canGoNext} onClick={onNext}>{isLast ? t('slide.startChallenge') : t('slide.next')}</Button>
      </div>
    </Card>
  )
}
