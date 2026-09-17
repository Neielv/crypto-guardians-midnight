import type { LessonId, ModuleId } from '@/domains/learning/learning.types'

export type CodeLabType = 'fill_in_the_blank' | 'fix_the_line' | 'compose_condition' | 'toggle_visibility' | 'code_ordering'

export type CodeLabEffects = {
  onSuccess?: { increaseExposure?: number }
  onFailure?: { increaseExposure?: number }
}

type FillInTheBlankPayload = { template: string; blanks: Array<{ id: string; answer: string }> }
type FixTheLinePayload = { original: string; expected: string }
type ComposeConditionPayload = { fragments: string[]; expected: string }
type ToggleVisibilityPayload = {
  fields: Array<{ id: string; label: string; dataType: string; expectedScope: 'ledger' | 'witness' }>
}
type CodeLabOrderingPayload = { lines: Array<{ id: string; value: string }>; correctOrder: string[] }

export type CodeLabPayloadMap = {
  fill_in_the_blank: FillInTheBlankPayload
  fix_the_line: FixTheLinePayload
  compose_condition: ComposeConditionPayload
  toggle_visibility: ToggleVisibilityPayload
  code_ordering: CodeLabOrderingPayload
}

export type BaseCodeLabDefinition<TType extends CodeLabType> = {
  codeLabId: string
  moduleId: ModuleId
  lessonId: LessonId
  type: TType
  title: string
  instructions: string
  successCriteria: string
  narrativeIntro?: string
  hints?: string[]
  maxAttempts?: number
  effects?: CodeLabEffects
  payload: CodeLabPayloadMap[TType]
}

export type CodeLabDefinition =
  | BaseCodeLabDefinition<'fill_in_the_blank'>
  | BaseCodeLabDefinition<'fix_the_line'>
  | BaseCodeLabDefinition<'compose_condition'>
  | BaseCodeLabDefinition<'toggle_visibility'>
  | BaseCodeLabDefinition<'code_ordering'>
