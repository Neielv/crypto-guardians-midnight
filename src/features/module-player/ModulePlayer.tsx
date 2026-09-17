import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppStore } from '@/app/store/app-store'
import { getChallengeById, getCodeLabById, getLessonsByModuleId, getModuleById, getSlidesByIds, getSupportMaterialsBySlideId } from '@/domains/learning/content-resolver'
import type { LessonId, ModuleId } from '@/domains/learning/learning.types'
import { AppShell } from '@/components/layout/AppShell'
import { LessonSidebar } from '@/components/game/LessonSidebar'
import { SlideViewer } from '@/components/game/SlideViewer'
import { ChallengeRunner } from '@/features/challenge-runner/ChallengeRunner'
import { CodeLabRunner } from '@/features/code-lab-runner/CodeLabRunner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ROUTES } from '@/lib/constants/routes'

export function ModulePlayer({ moduleId }: { moduleId: ModuleId }) {
  const { t } = useTranslation('common')
  const content = useAppStore((state) => state.content)
  const progress = useAppStore((state) => state.progress)
  const completeLesson = useAppStore((state) => state.completeLesson)
  const completeModule = useAppStore((state) => state.completeModule)
  const markChallengeCompleted = useAppStore((state) => state.markChallengeCompleted)
  const markCodeLabCompleted = useAppStore((state) => state.markCodeLabCompleted)
  const increaseExposure = useAppStore((state) => state.increaseExposure)
  const startModule = useAppStore((state) => state.startModule)
  const openLessonInStore = useAppStore((state) => state.openLesson)

  const module = useMemo(() => (content ? getModuleById(content, moduleId) : null), [content, moduleId])
  const lessons = useMemo(() => (content ? getLessonsByModuleId(content, moduleId) : []), [content, moduleId])
  const firstAvailableLesson = lessons.find((lesson) => progress.modules[moduleId]?.lessons[lesson.lessonId]?.status !== 'locked')?.lessonId ?? lessons[0]?.lessonId ?? null

  const [activeLessonId, setActiveLessonId] = useState<LessonId | null>(firstAvailableLesson)
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [lessonCompleted, setLessonCompleted] = useState(false)
  const [showIntro, setShowIntro] = useState(false)

  useEffect(() => {
    setShowIntro(!!module?.introScene || !!module?.introImage)
  }, [module])

  const lesson = useMemo(() => lessons.find((item) => item.lessonId === activeLessonId) ?? null, [lessons, activeLessonId])
  const step = lesson?.steps[activeStepIndex] ?? null
  const isDeferredChallenge = step?.type === 'challenge'
    && (step.challengeId === 'm4-l2-challenge-1' || step.challengeId === 'm4-l4-challenge-1')
  const slides = useMemo(() => {
    if (!content || !step || step.type !== 'slides') return []
    return getSlidesByIds(content, step.slideIds)
  }, [content, step])
  const activeSlide = slides[activeSlideIndex] ?? null
  const activeSupportMaterials = useMemo(() => {
    if (!content || !activeSlide) return []
    return getSupportMaterialsBySlideId(content, activeSlide.slideId)
  }, [content, activeSlide])

  const completeCurrentLesson = () => {
    if (!lesson) return
    completeLesson(moduleId, lesson.lessonId)
    setLessonCompleted(true)
  }

  const goToNextStep = () => {
    if (!lesson) return
    if (activeStepIndex < lesson.steps.length - 1) {
      setActiveStepIndex((current) => current + 1)
      setActiveSlideIndex(0)
      return
    }
    completeCurrentLesson()
  }

  const openLesson = (lessonId: LessonId) => {
    setActiveLessonId(lessonId)
    setActiveStepIndex(0)
    setActiveSlideIndex(0)
    setLessonCompleted(false)
  }

  const nextLesson = lessons.find((item) => item.lessonId !== activeLessonId && progress.modules[moduleId]?.lessons[item.lessonId]?.status === 'available')
  const activeLessonIndex = lessons.findIndex((item) => item.lessonId === activeLessonId)
  const currentStepLabel = step?.type === 'slides' ? t('module.badgeLesson') : step?.type === 'challenge' ? t('module.badgeChallenge') : t('module.badgeCodeLab')
  const moduleStatus = progress.modules[moduleId]?.status
  const nextModuleId = module?.unlocks ?? null
  const [moduleCompleted, setModuleCompleted] = useState(moduleStatus === 'completed')

  useEffect(() => {
    if (activeLessonId) {
      openLessonInStore(moduleId, activeLessonId)
      return
    }

    startModule(moduleId)
  }, [activeLessonId, moduleId, openLessonInStore, startModule])

  useEffect(() => {
    setModuleCompleted(moduleStatus === 'completed')
  }, [moduleStatus])

  return (
    <AppShell sidebar={<div className="module-player__sidebar" style={{ display: 'grid', gap: 16 }}><Link to={ROUTES.dashboard} style={{ textDecoration: 'none' }}><Button variant="secondary" style={{ width: '100%' }}>{t('navigation.backToDashboard')}</Button></Link><LessonSidebar lessons={lessons} progress={progress} moduleId={moduleId} activeLessonId={activeLessonId} onSelect={openLesson} /></div>} sidebarWidth={320}>
      <div className="module-player">
      {showIntro || moduleCompleted ? (
        <div
          style={{
            marginBottom: 24,
            padding: 24,
            borderRadius: 24,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(135deg, rgba(17,17,17,0.98) 0%, rgba(11,18,25,0.98) 55%, rgba(10,10,10,0.98) 100%)',
          }}
        >
          <div className="module-player__module-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'start' }}>
            <div>
              <div style={{ color: '#a1a1aa', fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{t('module.moduleLabel', { moduleId: moduleId.toUpperCase() })}</div>
              <h1 style={{ margin: '0 0 12px 0', fontSize: 36 }}>{module?.narrativeTitle ?? module?.title ?? moduleId}</h1>
              <p style={{ margin: 0, color: '#d4d4d8', maxWidth: 760, lineHeight: 1.7 }}>{module?.summary}</p>
            </div>
            <Badge tone="neutral">{currentStepLabel}</Badge>
          </div>
          {module?.concepts?.length ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {module.concepts.map((concept) => (
                <Badge key={concept} tone="neutral">{concept}</Badge>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <div>
          {showIntro && (module?.introScene || module?.introImage) ? (
            <Card>
              {module.introImage ? (
                <div className="module-player__intro-media" style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 24, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img 
                    src={`${import.meta.env.BASE_URL}${module.introImage}`} 
                    alt="Intro scene" 
                    style={{ width: '100%', display: 'block', minHeight: 300, objectFit: 'cover' }} 
                  />
                  {module.introScene && (
                    <div style={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      padding: '40px 24px 24px 24px', 
                      background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 60%, transparent 100%)',
                      color: '#f4f4f5'
                    }}>
                      <p style={{ margin: 0, lineHeight: 1.6, fontSize: 18, textShadow: '0 2px 4px rgba(0,0,0,0.5)', maxWidth: '95%', whiteSpace: 'pre-line' }}>
                        {module.introScene.replace('{{agent}}', useAppStore.getState().agent?.witness.alias || 'Agente')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                module.introScene && (
                  <p style={{ margin: '0 0 18px 0', color: '#d4d4d8', lineHeight: 1.7, fontSize: 16, whiteSpace: 'pre-line' }}>
                    {module.introScene.replace('{{agent}}', useAppStore.getState().agent?.witness.alias || 'Agente')}
                  </p>
                )
              )}
              <Button style={{ width: '100%', marginTop: 8 }} onClick={() => setShowIntro(false)}>{module.startButtonLabel ?? 'Comenzar'}</Button>
            </Card>
          ) : null}

          {!showIntro && !lessonCompleted && !moduleCompleted && lesson ? (
            <div className="module-player__lesson-header" style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div>
                <div style={{ color: '#a1a1aa', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{t('module.currentLesson')}</div>
                <h2 style={{ margin: '6px 0 6px 0' }}>{lesson.title}</h2>
                <p style={{ margin: 0, color: '#d4d4d8' }}>{lesson.objective}</p>
              </div>
              <Badge tone="warning">{t('module.lessonProgress', { current: activeLessonIndex + 1, total: lessons.length })}</Badge>
            </div>
          ) : null}

          {!showIntro && lessonCompleted && !moduleCompleted ? (
            <Card>
              <div className="module-player__completion-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ color: '#86efac', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{t('status.completed')}</div>
                  <h2 style={{ margin: 0 }}>{t('module.lessonCompleted')}</h2>
                </div>
                <Badge tone="success">{t('module.secureProgress')}</Badge>
              </div>
              <p style={{ color: '#d4d4d8' }}>{lesson?.title}</p>
              <div className="module-player__completion-actions" style={{ display: 'flex', gap: 8, marginTop: 18 }}>
                {nextLesson ? <Button onClick={() => openLesson(nextLesson.lessonId)}>{t('module.nextLesson')}</Button> : <Button onClick={() => { completeModule(moduleId); setModuleCompleted(true) }}>{t('module.completeModule')}</Button>}
              </div>
            </Card>
          ) : null}

          {!showIntro && moduleCompleted ? (
            <Card>
              <div className="module-player__completion-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ color: '#86efac', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{t('status.completed')}</div>
                  <h2 style={{ margin: 0 }}>{t('module.moduleCompleted')}</h2>
                </div>
                <Badge tone="success">{t('module.secureProgress')}</Badge>
              </div>
              <p style={{ color: '#d4d4d8', marginTop: 0 }}>{t('module.moduleCompletedDescription')}</p>
              <div className="module-player__completion-actions" style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                <Link to={ROUTES.dashboard} style={{ textDecoration: 'none' }}><Button variant="secondary">{t('navigation.backToDashboard')}</Button></Link>
                {nextModuleId ? <Link to={`/modules/${nextModuleId}`} style={{ textDecoration: 'none' }}><Button>{t('module.goToNextModule')}</Button></Link> : null}
              </div>
            </Card>
          ) : null}

          {!showIntro && !moduleCompleted && !lessonCompleted && lesson && step?.type === 'slides' && slides.length > 0 ? (
            <SlideViewer
              slide={activeSlide!}
              supportMaterials={activeSupportMaterials}
              current={activeSlideIndex + 1}
              total={slides.length}
              canGoBack={activeSlideIndex > 0}
              canGoNext={activeSlideIndex < slides.length}
              onBack={() => setActiveSlideIndex((current) => Math.max(0, current - 1))}
              onNext={() => {
                if (activeSlideIndex < slides.length - 1) {
                  setActiveSlideIndex((current) => current + 1)
                } else {
                  goToNextStep()
                }
              }}
              isLast={activeSlideIndex === slides.length - 1}
            />
          ) : null}

          {!showIntro && !moduleCompleted && !lessonCompleted && step?.type === 'challenge' && content ? (
            <ChallengeRunner
              challenge={getChallengeById(content, step.challengeId)!}
              onSuccess={(exposureDelta) => {
                markChallengeCompleted(step.challengeId)
                if (exposureDelta > 0) increaseExposure(exposureDelta)
                if (!isDeferredChallenge) goToNextStep()
              }}
              {...(isDeferredChallenge ? { onSuccessContinue: () => goToNextStep() } : {})}
            />
          ) : null}

          {!showIntro && !moduleCompleted && !lessonCompleted && step?.type === 'code_lab' && content ? (
            <CodeLabRunner
              codeLab={getCodeLabById(content, step.codeLabId)!}
              onSuccess={(exposureDelta) => {
                markCodeLabCompleted(step.codeLabId)
                if (exposureDelta > 0) increaseExposure(exposureDelta)
                goToNextStep()
              }}
            />
          ) : null}
      </div>
      </div>
    </AppShell>
  )
}
