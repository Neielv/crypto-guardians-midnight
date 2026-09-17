import type { LearningContent } from './learning.model'

export type ValidationIssue = {
  severity: 'error' | 'warning'
  code: string
  message: string
}

export function validateLearningContent(content: LearningContent): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const moduleIds = new Set(content.modules.map((module) => module.moduleId))
  const lessonIds = new Set(content.lessons.map((lesson) => lesson.lessonId))
  const slideIds = new Set(content.slides.map((slide) => slide.slideId))
  const challengeIds = new Set(content.challenges.map((challenge) => challenge.challengeId))
  const codeLabIds = new Set(content.codeLabs.map((lab) => lab.codeLabId))

  for (const lesson of content.lessons) {
    if (!moduleIds.has(lesson.moduleId)) {
      issues.push({ severity: 'error', code: 'LESSON_MODULE_MISSING', message: `Lesson ${lesson.lessonId} references unknown module ${lesson.moduleId}` })
    }

    if (lesson.steps[0]?.type !== 'slides') {
      issues.push({ severity: 'warning', code: 'LESSON_SHOULD_START_WITH_SLIDES', message: `Lesson ${lesson.lessonId} should start with slides in this MVP` })
    }

    for (const step of lesson.steps) {
      if (step.type === 'slides') {
        for (const slideId of step.slideIds) {
          if (!slideIds.has(slideId)) issues.push({ severity: 'error', code: 'STEP_SLIDE_MISSING', message: `Missing slide ${slideId}` })
        }
      }
      if (step.type === 'challenge' && !challengeIds.has(step.challengeId)) issues.push({ severity: 'error', code: 'STEP_CHALLENGE_MISSING', message: `Missing challenge ${step.challengeId}` })
      if (step.type === 'code_lab' && !codeLabIds.has(step.codeLabId)) issues.push({ severity: 'error', code: 'STEP_CODELAB_MISSING', message: `Missing code lab ${step.codeLabId}` })
    }
  }

  for (const slide of content.slides) {
    if (!lessonIds.has(slide.lessonId)) issues.push({ severity: 'error', code: 'SLIDE_LESSON_MISSING', message: `Slide ${slide.slideId} references unknown lesson ${slide.lessonId}` })
    if (!moduleIds.has(slide.moduleId)) issues.push({ severity: 'error', code: 'SLIDE_MODULE_MISSING', message: `Slide ${slide.slideId} references unknown module ${slide.moduleId}` })
  }

  for (const material of content.supportMaterials) {
    if (!moduleIds.has(material.moduleId)) issues.push({ severity: 'error', code: 'SUPPORT_MATERIAL_MODULE_MISSING', message: `Support material ${material.supportMaterialId} references unknown module ${material.moduleId}` })
  }

  for (const challenge of content.challenges) {
    if (!moduleIds.has(challenge.moduleId)) issues.push({ severity: 'error', code: 'CHALLENGE_MODULE_MISSING', message: `Challenge ${challenge.challengeId} references unknown module ${challenge.moduleId}` })
  }

  for (const lab of content.codeLabs) {
    if (!moduleIds.has(lab.moduleId)) issues.push({ severity: 'error', code: 'CODELAB_MODULE_MISSING', message: `Code lab ${lab.codeLabId} references unknown module ${lab.moduleId}` })
  }

  return issues
}

export function validateLocaleParity(base: LearningContent, compare: LearningContent): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  const normalize = <T,>(items: T[], getter: (item: T) => string) => items.map(getter).sort().join('|')
  if (normalize(base.modules, (item) => item.moduleId) !== normalize(compare.modules, (item) => item.moduleId)) {
    issues.push({ severity: 'error', code: 'LOCALE_MODULE_MISMATCH', message: 'Module ids differ between locales' })
  }
  if (normalize(base.lessons, (item) => item.lessonId) !== normalize(compare.lessons, (item) => item.lessonId)) {
    issues.push({ severity: 'error', code: 'LOCALE_LESSON_MISMATCH', message: 'Lesson ids differ between locales' })
  }
  if (normalize(base.slides, (item) => item.slideId) !== normalize(compare.slides, (item) => item.slideId)) {
    issues.push({ severity: 'error', code: 'LOCALE_SLIDE_MISMATCH', message: 'Slide ids differ between locales' })
  }
  return issues
}
