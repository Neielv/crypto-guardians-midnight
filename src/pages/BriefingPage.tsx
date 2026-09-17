import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ROUTES } from '@/lib/constants/routes'
import { useAppStore } from '@/app/store/app-store'
import { Button } from '@/components/ui/Button'

type SlideText = {
  text: string
  type: 'italic' | 'normal' | 'bold'
}

type SlideData = {
  id: number
  image: string
  gap: number
  texts: SlideText[]
}

export default function BriefingPage() {
  const { t, i18n } = useTranslation('common')
  const completeBriefing = useAppStore((state) => state.completeBriefing)
  const navigate = useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<SlideData[]>([])

  const handleAccept = () => {
    completeBriefing()
    navigate(ROUTES.dashboard)
  }

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const lang = i18n.language.startsWith('es') ? 'es' : 'en'
        const module = await import(`../content/${lang}/briefing.json`)
        setSlides(module.default)
      } catch (error) {
        console.error('Failed to load briefing slides', error)
      }
    }
    loadSlides()
  }, [i18n.language])

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1)
    }
  }

  if (slides.length === 0) return null

  return (
    <main
      className="briefing-page"
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.08), transparent 40%), radial-gradient(circle at 30% 80%, rgba(56,189,248,0.06), transparent 35%), #050505',
        padding: 24,
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes imageFadeIn {
            from { opacity: 0.4; }
            to { opacity: 0.9; }
          }
        `}
      </style>

      <section
        className="briefing-page__card"
        style={{
          maxWidth: 860, // Más ancha para acercarse al formato 16:9 de las imágenes
          width: '100%',
          minHeight: 480, // Menos alta para que no necesite recortar los costados
          borderRadius: 20,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0a0a0a',
        }}
      >
        {/* IMAGE AS CARD BACKGROUND */}
        <img
          className="briefing-page__image"
          key={slides[currentSlide].image}
          src={`${import.meta.env.BASE_URL}${slides[currentSlide].image}`}
          alt="Briefing visual"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center', // Centrado absoluto para mostrar la mayor parte posible
            animation: 'imageFadeIn 0.8s ease-out',
            zIndex: 0,
          }}
        />

        {/* TOP GRADIENT FOR TITLE READABILITY */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 50%, transparent 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* SUBTLE BOTTOM GRADIENT (Just for edges) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)',
            zIndex: 1,
            pointerEvents: 'none',
          }}
        />

        {/* TOP SECTION: TITLE */}
        <div className="briefing-page__title" style={{ padding: '32px 40px 24px 40px', position: 'relative', zIndex: 10 }}>
          <p
            style={{
              fontSize: 12,
              color: '#8b5cf6',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 700,
              marginBottom: 12,
              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
            }}
          >
            {t('briefing.codename')}
          </p>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#f5f5f5',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              margin: 0,
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
            }}
          >
            {t('briefing.title')}
          </h1>
        </div>

        {/* GLASSMORPHISM STRIP WITH TEXT */}
        <div
          className="briefing-page__text-strip"
          style={{
            position: 'relative',
            zIndex: 10,
            width: '100%',
            padding: '12px 24px', // Padding ultra compacto
            background: 'rgba(243, 234, 234, 0.05)', // Transparent dark glass
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* Text Content Dinámico */}
          <div
            className="briefing-page__text"
            key={currentSlide} // Fuerza re-render para la animación al cambiar de slide
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: slides[currentSlide].gap,
              animation: 'fadeIn 0.5s ease-in-out',
            }}
          >
            {slides[currentSlide].texts.map((text, idx) => (
              <p
                key={idx}
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: text.type === 'normal' ? '#d4d4d8' : '#f4f4f5',
                  fontStyle: text.type === 'italic' ? 'italic' : 'normal',
                  fontWeight: text.type === 'bold' ? 600 : text.type === 'italic' ? 500 : 400,
                }}
              >
                {text.text}
              </p>
            ))}
          </div>

          <div
            className="briefing-page__navigation"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 10, // Margen mínimo
              paddingTop: 10, // Padding mínimo
              borderTop: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {/* Dots */}
            <div className="briefing-page__dots" style={{ display: 'flex', gap: 8 }}>
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  style={{
                    width: i === currentSlide ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: i === currentSlide ? '#8b5cf6' : 'rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="briefing-page__controls" style={{ display: 'flex', gap: 10 }}>
              {currentSlide > 0 && (
                <Button
                  variant="secondary"
                  onClick={prevSlide}
                  style={{
                    padding: '8px 16px',
                    fontSize: 14,
                    color: '#e4e4e7',
                    borderColor: 'rgba(255,255,255,0.2)',
                    background: 'transparent',
                  }}
                >
                  {t('slide.previous')}
                </Button>
              )}

              {currentSlide < slides.length - 1 ? (
                <Button
                  variant="primary"
                  onClick={nextSlide}
                  style={{ padding: '8px 20px', fontSize: 14 }}
                >
                  {t('slide.next')}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleAccept}
                  style={{ padding: '8px 20px', fontSize: 14 }}
                >
                  {t('briefing.acceptMission')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
