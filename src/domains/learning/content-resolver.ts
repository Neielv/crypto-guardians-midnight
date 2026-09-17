import type { LearningContent } from './learning.model'
import type { ChallengeId, CodeLabId, LessonId, ModuleId, SlideId } from './learning.types'

export function getModuleById(content: LearningContent, moduleId: ModuleId) {
  return content.modules.find((module) => module.moduleId === moduleId) ?? null
}

export function getLessonsByModuleId(content: LearningContent, moduleId: ModuleId) {
  return content.lessons.filter((lesson) => lesson.moduleId === moduleId)
}

export function getLessonById(content: LearningContent, lessonId: LessonId) {
  return content.lessons.find((lesson) => lesson.lessonId === lessonId) ?? null
}

export function getSlidesByIds(content: LearningContent, slideIds: SlideId[]) {
  const map = new Map(content.slides.map((slide) => [slide.slideId, slide]))
  return slideIds.map((slideId) => map.get(slideId)).filter(Boolean)
}

export function getSupportMaterialsBySlideId(content: LearningContent, slideId: SlideId) {
  return content.supportMaterials.filter((item) => item.slideId === slideId)
}

export function getChallengeById(content: LearningContent, challengeId: ChallengeId) {
  return content.challenges.find((challenge) => challenge.challengeId === challengeId) ?? null
}

export function getCodeLabById(content: LearningContent, codeLabId: CodeLabId) {
  return content.codeLabs.find((lab) => lab.codeLabId === codeLabId) ?? null
}
