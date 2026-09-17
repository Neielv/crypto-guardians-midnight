import type { ChallengeDefinition } from '@/features/challenge-runner/challenge.types'
import type { CodeLabDefinition } from '@/features/code-lab-runner/code-lab.types'
import type { GameContent, ImagePromptDefinition, LessonDefinition, ModuleDefinition, SlideDefinition, SupportMaterialDefinition } from './learning.types'

export type LearningContent = {
  modules: ModuleDefinition[]
  lessons: LessonDefinition[]
  slides: SlideDefinition[]
  supportMaterials: SupportMaterialDefinition[]
  challenges: ChallengeDefinition[]
  codeLabs: CodeLabDefinition[]
  imagePrompts?: ImagePromptDefinition[]
  game?: GameContent
}
