import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAppStore } from '@/app/store/app-store'
import { loadLearningContent } from '@/domains/learning/content-loader'
import { ModulePlayer } from '@/features/module-player/ModulePlayer'

export default function ModulePage() {
  const { moduleId } = useParams()
  const locale = useAppStore((state) => state.locale)
  const bootstrapContent = useAppStore((state) => state.bootstrapContent)
  const bootstrapProgress = useAppStore((state) => state.bootstrapProgress)
  const content = useAppStore((state) => state.content)
  const progress = useAppStore((state) => state.progress)

  useEffect(() => {
    if (!moduleId) return
    void loadLearningContent(locale).then((result) => {
      if (result.ok) {
        bootstrapContent(result.data)
        bootstrapProgress()
      }
    })
  }, [bootstrapContent, bootstrapProgress, locale, moduleId])

  if (!moduleId) return <main style={{ padding: 32 }}>Missing module id</main>
  if (content === null || Object.keys(progress.modules).length === 0) return <main style={{ padding: 32 }}>Loading module...</main>

  return <ModulePlayer key={moduleId} moduleId={moduleId as never} />
}
