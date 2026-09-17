import type { LearningContent } from '@/domains/learning/learning.model'
import type { LessonId, ModuleId } from '@/domains/learning/learning.types'
import type { LessonProgress, LessonProgressStatus, ModuleProgress, ModuleProgressStatus, ProgressState } from './progression.model'

export function createInitialLessonProgress(lessonId: LessonId, status: LessonProgressStatus): LessonProgress {
  return {
    lessonId,
    status,
    currentStepIndex: 0,
    currentSlideIndex: 0,
    completedStepIds: [],
    completedChallengeIds: [],
    completedCodeLabIds: [],
  }
}

export function createInitialModuleProgress(content: LearningContent, moduleId: ModuleId, status: ModuleProgressStatus): ModuleProgress {
  const lessons = content.lessons.filter((lesson) => lesson.moduleId === moduleId)
  const lessonMap = Object.fromEntries(
    lessons.map((lesson, index) => [
      lesson.lessonId,
      createInitialLessonProgress(lesson.lessonId, status === 'available' && index === 0 ? 'available' : 'locked'),
    ]),
  ) as ModuleProgress['lessons']

  return { moduleId, status, lessons: lessonMap }
}

export function createInitialProgressState(content: LearningContent): ProgressState {
  const modules = Object.fromEntries(
    content.modules.map((module, index) => [module.moduleId, createInitialModuleProgress(content, module.moduleId, index === 0 ? 'available' : 'locked')]),
  ) as ProgressState['modules']

  return {
    currentModuleId: null,
    currentLessonId: null,
    modules,
    completedModuleIds: [],
    completedLessonIds: [],
    completedChallengeIds: [],
    completedCodeLabIds: [],
    hasCompletedBriefing: false,
    hasCompletedFinalBoss: false,
    finalBadge: null,
  }
}

export function synchronizeProgressState(content: LearningContent, progress: ProgressState): ProgressState {
  const syncedModules = Object.fromEntries(
    content.modules.map((module, moduleIndex) => {
      const existingModule = progress.modules[module.moduleId]
      const moduleStatus = existingModule?.status ?? (moduleIndex === 0 ? 'available' : 'locked')
      const lessons = content.lessons.filter((lesson) => lesson.moduleId === module.moduleId)
      const existingLessons = existingModule?.lessons ?? {}
      const hasUnlockedLesson = lessons.some((lesson) => {
        const status = existingLessons[lesson.lessonId]?.status
        return status === 'available' || status === 'completed'
      })

      const mergedLessons = Object.fromEntries(
        lessons.map((lesson, lessonIndex) => [
          lesson.lessonId,
          existingLessons[lesson.lessonId]
            ?? createInitialLessonProgress(
              lesson.lessonId,
              moduleStatus !== 'locked' && !hasUnlockedLesson && lessonIndex === 0 ? 'available' : 'locked',
            ),
        ]),
      ) as ModuleProgress['lessons']

      return [
        module.moduleId,
        {
          moduleId: module.moduleId,
          status: moduleStatus,
          lessons: mergedLessons,
        },
      ]
    }),
  ) as ProgressState['modules']

  return {
    ...progress,
    modules: syncedModules,
  }
}

export function getLessonsForModule(content: LearningContent, moduleId: ModuleId) {
  return content.lessons.filter((lesson) => lesson.moduleId === moduleId)
}

export function getNextLessonId(content: LearningContent, moduleId: ModuleId, currentLessonId: LessonId): LessonId | null {
  const lessons = getLessonsForModule(content, moduleId)
  const index = lessons.findIndex((lesson) => lesson.lessonId === currentLessonId)
  return index === -1 ? null : lessons[index + 1]?.lessonId ?? null
}

export function completeLessonProgress(progress: ProgressState, content: LearningContent, moduleId: ModuleId, lessonId: LessonId): ProgressState {
  const moduleProgress = progress.modules[moduleId]
  if (!moduleProgress) return progress

  const nextLessonId = getNextLessonId(content, moduleId, lessonId)
  const updatedLessons = {
    ...moduleProgress.lessons,
    [lessonId]: { ...moduleProgress.lessons[lessonId], status: 'completed' as const },
  }

  if (nextLessonId && updatedLessons[nextLessonId]) {
    updatedLessons[nextLessonId] = {
      ...updatedLessons[nextLessonId],
      status: updatedLessons[nextLessonId].status === 'locked' ? 'available' : updatedLessons[nextLessonId].status,
    }
  }

  return {
    ...progress,
    currentModuleId: moduleId,
    currentLessonId: lessonId,
    completedLessonIds: progress.completedLessonIds.includes(lessonId) ? progress.completedLessonIds : [...progress.completedLessonIds, lessonId],
    modules: {
      ...progress.modules,
      [moduleId]: { ...moduleProgress, lessons: updatedLessons },
    },
  }
}

export function completeModuleProgress(progress: ProgressState, content: LearningContent, moduleId: ModuleId): ProgressState {
  const moduleDef = content.modules.find((module) => module.moduleId === moduleId)
  const nextModuleId = moduleDef?.unlocks ?? null

  const updatedModules = {
    ...progress.modules,
    [moduleId]: { ...progress.modules[moduleId], status: 'completed' as const },
  }

  if (nextModuleId && updatedModules[nextModuleId]) {
    const nextModule = updatedModules[nextModuleId]
    updatedModules[nextModuleId] = {
      ...nextModule,
      status: nextModule.status === 'locked' ? 'available' : nextModule.status,
      lessons: Object.fromEntries(
        Object.entries(nextModule.lessons).map(([lessonKey, lesson], index) => [
          lessonKey,
          { ...lesson, status: index === 0 && lesson.status === 'locked' ? 'available' : lesson.status },
        ]),
      ) as ModuleProgress['lessons'],
    }
  }

  return {
    ...progress,
    completedModuleIds: progress.completedModuleIds.includes(moduleId) ? progress.completedModuleIds : [...progress.completedModuleIds, moduleId],
    modules: updatedModules,
  }
}

export function getNextAvailableLessonId(progress: ProgressState, moduleId: ModuleId): LessonId | null {
  const moduleProgress = progress.modules[moduleId]
  if (!moduleProgress) return null
  return Object.values(moduleProgress.lessons).find((lesson) => lesson.status === 'available')?.lessonId ?? null
}

export function markChallengeCompleted(progress: ProgressState, challengeId: string): ProgressState {
  return {
    ...progress,
    completedChallengeIds: progress.completedChallengeIds.includes(challengeId)
      ? progress.completedChallengeIds
      : [...progress.completedChallengeIds, challengeId],
  }
}

export function markCodeLabCompleted(progress: ProgressState, codeLabId: string): ProgressState {
  return {
    ...progress,
    completedCodeLabIds: progress.completedCodeLabIds.includes(codeLabId)
      ? progress.completedCodeLabIds
      : [...progress.completedCodeLabIds, codeLabId],
  }
}
