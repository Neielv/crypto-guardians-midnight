import type { LessonId, ModuleId } from '@/domains/learning/learning.types'

export type ChallengeType = 'trivia' | 'classification' | 'drag_and_drop' | 'type_matching' | 'code_ordering' | 'visibility_editor'

export type ChallengeEffects = {
  onSuccess?: { increaseExposure?: number }
  onFailure?: { increaseExposure?: number }
}

type TriviaPayload = {
  question: string
  options: Array<{ id: string; label: string }>
  correctOptionId: string
}

type ClassificationPayload = {
  categories: Array<{ id: string; label: string }>
  items: Array<{ id: string; label: string }>
  validAssignments: Record<string, string>
}

type DragAndDropPayload = {
  items: Array<{ id: string; label: string }>
  zones: Array<{ id: string; label: string }>
  validAssignments: Record<string, string>
}

type TypeMatchingPayload = {
  prompts: Array<{ id: string; label: string }>
  options: Array<{ id: string; label: string }>
  correctMatches: Record<string, string>
}

type CodeOrderingPayload = {
  lines: Array<{ id: string; value: string }>
  correctOrder: string[]
}

type VisibilityEditorPayload = {
  fields: Array<{ id: string; label: string; expectedVisibility: 'public' | 'private' }>
}

export type ChallengePayloadMap = {
  trivia: TriviaPayload
  classification: ClassificationPayload
  drag_and_drop: DragAndDropPayload
  type_matching: TypeMatchingPayload
  code_ordering: CodeOrderingPayload
  visibility_editor: VisibilityEditorPayload
}

export type BaseChallengeDefinition<TType extends ChallengeType> = {
  challengeId: string
  moduleId: ModuleId
  lessonId: LessonId
  type: TType
  title: string
  instructions: string
  successCriteria: string
  narrativeIntro?: string
  hints?: string[]
  maxAttempts?: number
  effects?: ChallengeEffects
  payload: ChallengePayloadMap[TType]
}

export type ChallengeDefinition =
  | BaseChallengeDefinition<'trivia'>
  | BaseChallengeDefinition<'classification'>
  | BaseChallengeDefinition<'drag_and_drop'>
  | BaseChallengeDefinition<'type_matching'>
  | BaseChallengeDefinition<'code_ordering'>
  | BaseChallengeDefinition<'visibility_editor'>
