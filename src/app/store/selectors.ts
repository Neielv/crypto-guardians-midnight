import type { AppStore } from './app-store.types'
import type { ModuleId } from '@/domains/learning/learning.types'
import type { ModuleProgressStatus } from '@/domains/progression/progression.model'

export const selectLocale = (state: AppStore) => state.locale
export const selectAgent = (state: AppStore) => state.agent
export const selectContent = (state: AppStore) => state.content
export const selectProgress = (state: AppStore) => state.progress
export const selectExposure = (state: AppStore) => state.exposure
export const selectModuleRuntime = (state: AppStore) => state.moduleRuntime

export const selectModuleStatus = (state: AppStore, moduleId: string | ModuleId): ModuleProgressStatus =>
  state.progress.modules[moduleId as ModuleId]?.status ?? 'locked'

export const selectModuleTone = (state: AppStore, moduleId: string) => {
  const status = selectModuleStatus(state, moduleId)
  return status === 'completed' ? 'success' : status === 'available' ? 'warning' : 'neutral'
}
