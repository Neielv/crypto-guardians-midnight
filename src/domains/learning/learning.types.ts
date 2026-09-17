export type Locale = 'es' | 'en'

export type ModuleId = 'm0' | 'm1' | 'm2' | 'm3' | 'm4' | 'm5' | 'm6' | 'm7'

export type LessonId = string
export type SlideId = string
export type ChallengeId = string
export type CodeLabId = string

export type LessonStep =
  | {
      stepId: string
      type: 'slides'
      slideIds: SlideId[]
    }
  | {
      stepId: string
      type: 'challenge'
      challengeId: ChallengeId
    }
  | {
      stepId: string
      type: 'code_lab'
      codeLabId: CodeLabId
    }

export type ImagePromptDefinition = {
  moduleId: ModuleId
  prompt: string
  slideId?: SlideId
  lessonId?: LessonId
  locale?: Locale
  kind?: string
}

export type GameContent = {
  opening?: ImagePromptDefinition[]
  dashboard?: ImagePromptDefinition[]
  shared?: ImagePromptDefinition[]
}

export type GameLevelDefinition = {
  levelId: string
  narrativeTitle: string
  objectives: string[]
  unlocksLevelId?: string
}

export type ModuleDefinition = {
  moduleId: ModuleId
  title: string
  summary: string
  concepts: string[]
  unlocks: ModuleId | null
  narrativeTitle?: string
  technicalTitle?: string
  dramaticDescription?: string
  introScene?: string
  introImage?: string
  startButtonLabel?: string
}

export type LessonDefinition = {
  lessonId: LessonId
  moduleId: ModuleId
  title: string
  objective: string
  steps: LessonStep[]
  narrativeIntro?: string
}

export type SlideDefinition = {
  slideId: SlideId
  lessonId: LessonId
  moduleId: ModuleId
  order: number
  title: string
  text: string
  visualHint?: string
  image?: string
}

export type SupportMaterialDefinition = {
  supportMaterialId: string
  slideId: SlideId
  lessonId: LessonId
  moduleId: ModuleId
  sourceChapter: string
  sourceSection: string
  title: string
  excerpts: string[]
  codeBlocks?: Array<{
    title: string
    code: string
  }>
}
