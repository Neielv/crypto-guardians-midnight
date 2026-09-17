import type { LessonId, ModuleId } from '@/domains/learning/learning.types'

export type ChallengeType = 'trivia' | 'classification' | 'drag_and_drop' | 'type_matching' | 'code_ordering' | 'visibility_editor' | 'code_assembly' | 'state_simulation' | 'final_assembly'

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

type CodeAssemblyPayload = {
  successMessage?: string
  contextLines: string[]
  slots: Array<{ id: string; label: string }>
  pieces: Array<{ id: string; label: string }>
  correctOrder: string[]
}

type StateSimulationPayload = {
  ledgerLabel: string
  initialEntries: string[]
  survey: {
    title: string
    question: string
    options: Array<{ id: string; label: string }>
    identityLabel: string
    identityValue: string
    nullifierLabel: string
    nullifierValue: string
  }
  routine: {
    lines: Array<{ id: string; code: string }>
  }
  attempts: Array<{
    id: string
    title: string
    description: string
    outcome: 'accepted' | 'rejected'
    ledgerEntry: string
    reason: string
    completedLineIds: string[]
    activeLineId: string
  }>
}

type VisibilityEditorPayload = {
  fields: Array<{ id: string; label: string; expectedVisibility: 'public' | 'private' }>
}

export type FinalAssemblyPayload = {
  finalSummary: string
  stages: Array<{
    id: string
    title: string
    description: string
    pieces: Array<{ id: string; label: string }>
    correctPieceId: string
    explanation: string
  }>
}

export type ChallengePayloadMap = {
  trivia: TriviaPayload
  classification: ClassificationPayload
  drag_and_drop: DragAndDropPayload
  type_matching: TypeMatchingPayload
  code_ordering: CodeOrderingPayload
  visibility_editor: VisibilityEditorPayload
  code_assembly: CodeAssemblyPayload
  state_simulation: StateSimulationPayload
  final_assembly: FinalAssemblyPayload
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
  | BaseChallengeDefinition<'code_assembly'>
  | BaseChallengeDefinition<'state_simulation'>
  | BaseChallengeDefinition<'final_assembly'>
