import { Navigate, Outlet, useParams } from 'react-router-dom'
import { useAppStore } from '@/app/store/app-store'
import { ROUTES } from '@/lib/constants/routes'

export function RequireAgentIdentity() {
  const hasAgent = useAppStore((state) => Boolean(state.agent))
  return hasAgent ? <Outlet /> : <Navigate to={ROUTES.onboarding} replace />
}

export function RequireUnlockedModule() {
  const { moduleId } = useParams()
  const modules = useAppStore((state) => state.progress.modules)
  if (!moduleId) return <Navigate to={ROUTES.dashboard} replace />
  const status = modules[moduleId as keyof typeof modules]?.status
  return status === 'available' || status === 'completed' ? <Outlet /> : <Navigate to={ROUTES.dashboard} replace />
}
