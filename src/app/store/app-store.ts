import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { deriveExposureLevel } from '@/domains/exposure/exposure.model'
import {
  completeLessonProgress,
  completeModuleProgress,
  createInitialProgressState,
  getNextAvailableLessonId,
  markChallengeCompleted as markChallengeCompletedInProgress,
  markCodeLabCompleted as markCodeLabCompletedInProgress,
  synchronizeProgressState,
} from '@/domains/progression/progression.service'
import { migrateLegacyAgent } from '@/domains/agent/agent.model'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import type { AppStore } from './app-store.types'
import type { ProgressState } from '@/domains/progression/progression.model'
import { appendWorkspaceSnapshot, canCreateWorkspaceSnapshot, createWorkspaceState, selectWorkspaceSource, upgradeWorkspaceState } from '@/domains/workspace/workspace.model'
import type { WorkspaceValidationResult } from '@/domains/workspace/workspace.model'

const emptyProgress: ProgressState = {
  currentModuleId: null,
  currentLessonId: null,
  modules: {},
  completedModuleIds: [],
  completedLessonIds: [],
  completedChallengeIds: [],
  completedCodeLabIds: [],
  hasCompletedBriefing: false,
  hasCompletedFinalBoss: false,
  finalBadge: null,
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      locale: 'es',
      validationMode: 'local',
      agent: null,
      content: null,
      progress: { ...emptyProgress },
      exposure: { score: 0, level: 'safe' },
      moduleRuntime: null,
      workspace: null,
      bootstrapContent: (content) => set({ content }),
      bootstrapProgress: () => {
        const { content, progress } = get()
        if (!content) return
        set({ progress: Object.keys(progress.modules).length > 0 ? synchronizeProgressState(content, progress) : createInitialProgressState(content) })
      },
      setLocale: (locale) => set({ locale }),
      setValidationMode: (validationMode) => set({ validationMode }),
      createAgent: (witness) => set({ agent: { witness, createdAt: new Date().toISOString() } }),
      clearAgent: () => set({ agent: null }),
      completeBriefing: () => set((state) => ({ progress: { ...state.progress, hasCompletedBriefing: true } })),
      startModule: (moduleId) => set((state) => ({
        progress: { ...state.progress, currentModuleId: moduleId },
        moduleRuntime: { moduleId, currentLessonId: null, currentStepIndex: 0, currentSlideIndex: 0, currentView: 'overview', lastStepResult: null },
      })),
      setModuleRuntime: (moduleRuntime) => set({ moduleRuntime }),
      initializeWorkspace: (metadata, template, codeLabId) => {
        const current = upgradeWorkspaceState(get().workspace)
        if (!current || current.workspaceId !== metadata.workspaceId) {
          const workspace = createWorkspaceState(metadata, template, codeLabId)
          set({ workspace: { ...workspace, currentLabId: codeLabId } })
          return workspace.draft
        }
        const migratedDrafts = current.drafts ?? (current.currentLabId ? { [current.currentLabId]: current.draft } : {})
        const source = selectWorkspaceSource({ ...current, drafts: migratedDrafts }, metadata, template, codeLabId)
        set({ workspace: { ...current, drafts: migratedDrafts, draft: source, currentSource: source, currentLabId: codeLabId, updatedAt: new Date().toISOString() } })
        return source
      },
      updateWorkspaceDraft: (source, codeLabId) => set((state) => state.workspace ? {
        workspace: { ...state.workspace, draft: source, drafts: { ...(state.workspace.drafts ?? {}), [codeLabId]: source }, currentLabId: codeLabId, updatedAt: new Date().toISOString() },
      } : {}),
      recordWorkspaceValidation: (result: WorkspaceValidationResult, snapshotOnSuccess, source, metadata) => {
        let snapshotCreated = true
        set((state) => {
          if (!state.workspace) return {}
          const current = upgradeWorkspaceState(state.workspace)!
          const currentSource = source ?? current.currentSource
          const draftWorkspace = { ...current, draft: currentSource }
          if (snapshotOnSuccess && result.status === 'success') {
            if (!metadata || !canCreateWorkspaceSnapshot(draftWorkspace, metadata, result.codeLabId)) {
              snapshotCreated = false
              return { workspace: { ...draftWorkspace, validation: { ...result, status: 'failure', message: 'Workspace snapshot prerequisite is not satisfied.' }, updatedAt: new Date().toISOString() } }
            }
            return { workspace: appendWorkspaceSnapshot(draftWorkspace, { codeLabId: result.codeLabId, missionId: result.codeLabId, cumulativeStep: metadata.cumulativeStep, source: currentSource, validation: result }) }
          }
          return { workspace: { ...draftWorkspace, validation: result, updatedAt: new Date().toISOString() } }
        })
        return snapshotCreated
      },
      clearWorkspace: () => set({ workspace: null }),
      openLesson: (moduleId, lessonId) => set((state) => ({
        progress: { ...state.progress, currentModuleId: moduleId, currentLessonId: lessonId },
        moduleRuntime: { moduleId, currentLessonId: lessonId, currentStepIndex: 0, currentSlideIndex: 0, currentView: 'lesson_step', lastStepResult: null },
      })),
      goToStep: (currentStepIndex) => set((state) => ({ moduleRuntime: state.moduleRuntime ? { ...state.moduleRuntime, currentStepIndex, currentSlideIndex: 0, lastStepResult: null } : null })),
      goToSlide: (currentSlideIndex) => set((state) => ({ moduleRuntime: state.moduleRuntime ? { ...state.moduleRuntime, currentSlideIndex } : null })),
      setLastStepResult: (lastStepResult) => set((state) => ({ moduleRuntime: state.moduleRuntime ? { ...state.moduleRuntime, lastStepResult } : null })),
      setCurrentView: (currentView) => set((state) => ({ moduleRuntime: state.moduleRuntime ? { ...state.moduleRuntime, currentView } : null })),
      markChallengeCompleted: (challengeId) => set((state) => ({ progress: markChallengeCompletedInProgress(state.progress, challengeId) })),
      markCodeLabCompleted: (codeLabId) => set((state) => ({ progress: markCodeLabCompletedInProgress(state.progress, codeLabId) })),
      completeLesson: (moduleId, lessonId) => {
        const { content, progress } = get()
        if (!content) return
        const nextProgress = completeLessonProgress(progress, content, moduleId, lessonId)
        const nextLessonId = getNextAvailableLessonId(nextProgress, moduleId)
        set((state) => ({
          progress: nextProgress,
          moduleRuntime: state.moduleRuntime ? { ...state.moduleRuntime, currentView: 'feedback', currentLessonId: nextLessonId ?? lessonId, lastStepResult: 'success' } : null,
        }))
      },
      completeModule: (moduleId) => {
        const { content, progress } = get()
        if (!content) return
        set((state) => ({
          progress: completeModuleProgress(progress, content, moduleId),
          moduleRuntime: state.moduleRuntime ? { ...state.moduleRuntime, currentView: 'complete' } : null,
        }))
      },
      completeFinalBoss: (badge) => set((state) => ({ progress: { ...state.progress, hasCompletedFinalBoss: true, finalBadge: badge } })),
      increaseExposure: (amount) => set((state) => {
        const score = state.exposure.score + amount
        return { exposure: { score, level: deriveExposureLevel(score) } }
      }),
      resetProgress: () => set((state) => ({
        locale: state.locale,
        validationMode: state.validationMode,
        agent: state.agent,
        content: state.content,
        progress: state.content ? createInitialProgressState(state.content) : { ...emptyProgress },
        exposure: { score: 0, level: 'safe' },
        moduleRuntime: null,
        workspace: null,
      })),
    }),
    {
      name: STORAGE_KEYS.app,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        locale: state.locale,
        validationMode: state.validationMode,
        agent: state.agent,
        progress: state.progress,
        exposure: state.exposure,
        moduleRuntime: state.moduleRuntime,
        workspace: state.workspace,
      }),
      version: 3,
      migrate: (persistedState) => {
        const state = persistedState as Partial<AppStore>
        if (state.agent?.witness && 'nombre' in state.agent.witness) {
          return {
            ...state,
            agent: {
              witness: migrateLegacyAgent(state.agent.witness),
              createdAt: state.agent.createdAt || new Date().toISOString(),
            },
            workspace: state.workspace ?? null,
            validationMode: state.validationMode === 'backend' ? 'backend' : 'local',
          } as AppStore
        }
        return { ...state, workspace: state.workspace ?? null, validationMode: state.validationMode === 'backend' ? 'backend' : 'local' } as AppStore
      },
    },
  ),
)
