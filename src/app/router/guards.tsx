import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useAppStore } from '@/app/store/app-store'
import { ROUTES } from '@/lib/constants/routes'

export function RequireAgentIdentity() {
  const hasAgent = useAppStore((state) => Boolean(state.agent))
  return hasAgent ? <Outlet /> : <Navigate to={ROUTES.onboarding} replace />
}

export function RequireBriefingCompletion() {
  const hasCompletedBriefing = useAppStore((state) => state.progress.hasCompletedBriefing)
  return hasCompletedBriefing ? <Outlet /> : <Navigate to={ROUTES.briefing} replace />
}

export function RequireUnlockedModule() {
  const { moduleId } = useParams()
  const content = useAppStore((state) => state.content)
  const modules = useAppStore((state) => state.progress.modules)
  if (!moduleId) return <Navigate to={ROUTES.dashboard} replace />
  if (content === null || Object.keys(modules).length === 0) return <Outlet />
  const status = modules[moduleId as keyof typeof modules]?.status
  return status === 'available' || status === 'completed' ? <Outlet /> : <Navigate to={ROUTES.dashboard} replace />
}

export function RequireCompletedModules() {
  const content = useAppStore((state) => state.content)
  const modules = useAppStore((state) => state.progress.modules)
  const hasCompletedFinalBoss = useAppStore((state) => state.progress.hasCompletedFinalBoss)

  if (content === null || Object.keys(modules).length === 0) return <Outlet />
  if (hasCompletedFinalBoss) return <Navigate to={ROUTES.results} replace />

  const allModulesCompleted = content.modules.every((module) => modules[module.moduleId]?.status === 'completed')
  return allModulesCompleted ? <Outlet /> : <Navigate to={ROUTES.dashboard} replace />
}

export function RequireFinalBossCompletion() {
  const hasCompletedFinalBoss = useAppStore((state) => state.progress.hasCompletedFinalBoss)
  return hasCompletedFinalBoss ? <Outlet /> : <Navigate to={ROUTES.dashboard} replace />
}
