import { useTranslation } from 'react-i18next'
import type { LessonDefinition, LessonId } from '@/domains/learning/learning.types'
import type { ProgressState } from '@/domains/progression/progression.model'

type Props = {
  lessons: LessonDefinition[]
  progress: ProgressState
  moduleId: string
  activeLessonId: LessonId | null
  onSelect: (lessonId: LessonId) => void
}

export function LessonSidebar({ lessons, progress, moduleId, activeLessonId, onSelect }: Props) {
  const { t } = useTranslation('common')

  return (
    <aside
      style={{
        width: 280,
        display: 'grid',
        gap: 12,
        alignContent: 'start',
        padding: 16,
        borderRadius: 20,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(17,17,17,0.84)',
        height: 'fit-content',
        position: 'sticky',
        top: 92,
      }}
    >
      <div>
        <div style={{ color: '#a1a1aa', fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{t('module.sidebarTitle')}</div>
        <strong style={{ fontSize: 18 }}>{t('module.sidebarSubtitle')}</strong>
      </div>
      {lessons.map((lesson) => {
        const status = progress.modules[moduleId as keyof typeof progress.modules]?.lessons[lesson.lessonId]?.status ?? 'locked'
        const isActive = lesson.lessonId === activeLessonId
        const statusColor = status === 'completed' ? '#86efac' : status === 'available' ? '#fcd34d' : '#a1a1aa'
        return (
          <button
            key={lesson.lessonId}
            onClick={() => status !== 'locked' && onSelect(lesson.lessonId)}
            disabled={status === 'locked'}
            style={{
              textAlign: 'left',
              padding: 14,
              borderRadius: 16,
              border: isActive ? '1px solid rgba(56,189,248,0.8)' : '1px solid rgba(255,255,255,0.06)',
              background:
                status === 'completed'
                  ? 'linear-gradient(180deg, rgba(5,46,22,0.95) 0%, rgba(6,24,16,0.95) 100%)'
                  : isActive
                    ? 'linear-gradient(180deg, rgba(14,35,46,0.92) 0%, rgba(10,10,10,0.95) 100%)'
                    : 'linear-gradient(180deg, rgba(17,17,17,0.9) 0%, rgba(10,10,10,0.92) 100%)',
              color: '#f5f5f5',
              opacity: status === 'locked' ? 0.5 : 1,
              cursor: status === 'locked' ? 'not-allowed' : 'pointer',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
              <strong style={{ lineHeight: 1.35 }}>{lesson.title}</strong>
              <div style={{ display: 'grid', justifyItems: 'end', gap: 4 }}>
                <span style={{ fontSize: 12, color: statusColor, textTransform: 'uppercase' }}>{t(`status.${status}`)}</span>
                {isActive ? <span style={{ fontSize: 11, color: '#7dd3fc', textTransform: 'uppercase' }}>{t('status.active')}</span> : null}
              </div>
            </div>
          </button>
        )
      })}
    </aside>
  )
}
