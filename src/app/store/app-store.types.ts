import type { AgentProfile, AgentWitness } from '@/domains/agent/agent.model'
import type { ExposureState } from '@/domains/exposure/exposure.model'
import type { LearningContent } from '@/domains/learning/learning.model'
import type { LessonId, Locale, ModuleId } from '@/domains/learning/learning.types'
import type { ProgressState } from '@/domains/progression/progression.model'
import type { ModuleRuntimeState, ModuleRuntimeView } from '@/features/module-player/module-player.types'
import type { CodeLabWorkspaceMetadata } from '@/features/code-lab-runner/code-lab.types'
import type { WorkspaceState, WorkspaceValidationResult } from '@/domains/workspace/workspace.model'

export type AppState = {
  locale: Locale
  agent: AgentProfile | null
  content: LearningContent | null
  progress: ProgressState
  exposure: ExposureState
  moduleRuntime: ModuleRuntimeState | null
  workspace: WorkspaceState | null
}

export type AppActions = {
  bootstrapContent: (content: LearningContent) => void
  bootstrapProgress: () => void
  setLocale: (locale: Locale) => void
  createAgent: (witness: AgentWitness) => void
  clearAgent: () => void
  completeBriefing: () => void
  startModule: (moduleId: ModuleId) => void
  setModuleRuntime: (runtime: ModuleRuntimeState | null) => void
  initializeWorkspace: (metadata: CodeLabWorkspaceMetadata, template: string, codeLabId: string) => string
  updateWorkspaceDraft: (source: string, codeLabId: string) => void
  recordWorkspaceValidation: (result: WorkspaceValidationResult, snapshotOnSuccess: boolean, source?: string, metadata?: CodeLabWorkspaceMetadata) => boolean
  clearWorkspace: () => void
  openLesson: (moduleId: ModuleId, lessonId: LessonId) => void
  goToStep: (stepIndex: number) => void
  goToSlide: (slideIndex: number) => void
  setLastStepResult: (result: 'success' | 'failure' | null) => void
  setCurrentView: (view: ModuleRuntimeView) => void
  markChallengeCompleted: (challengeId: string) => void
  markCodeLabCompleted: (codeLabId: string) => void
  completeLesson: (moduleId: ModuleId, lessonId: LessonId) => void
  completeModule: (moduleId: ModuleId) => void
  completeFinalBoss: (badge: string) => void
  increaseExposure: (amount: number) => void
  resetProgress: () => void
}

export type AppStore = AppState & AppActions
