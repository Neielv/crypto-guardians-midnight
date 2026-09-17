import type { LessonId, ModuleId } from '@/domains/learning/learning.types'

export type LessonProgressStatus = 'locked' | 'available' | 'completed'
export type ModuleProgressStatus = 'locked' | 'available' | 'completed'

export type LessonProgress = {
  lessonId: LessonId
  status: LessonProgressStatus
  currentStepIndex: number
  currentSlideIndex: number
  completedStepIds: string[]
  completedChallengeIds: string[]
  completedCodeLabIds: string[]
}

export type ModuleProgress = {
  moduleId: ModuleId
  status: ModuleProgressStatus
  lessons: Record<LessonId, LessonProgress>
}

export type ProgressState = {
  currentModuleId: ModuleId | null
  currentLessonId: LessonId | null
  modules: Partial<Record<ModuleId, ModuleProgress>>
  completedModuleIds: ModuleId[]
  completedLessonIds: LessonId[]
  completedChallengeIds: string[]
  completedCodeLabIds: string[]
  hasCompletedBriefing: boolean
  hasCompletedFinalBoss: boolean
  finalBadge: string | null
}
