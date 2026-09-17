import type { LessonId, ModuleId } from '@/domains/learning/learning.types'

export type ModuleRuntimeView = 'overview' | 'lesson_step' | 'feedback' | 'complete'

export type ModuleRuntimeState = {
  moduleId: ModuleId
  currentLessonId: LessonId | null
  currentStepIndex: number
  currentSlideIndex: number
  currentView: ModuleRuntimeView
  lastStepResult: 'success' | 'failure' | null
}
