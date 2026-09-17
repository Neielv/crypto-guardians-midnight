import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAgentIdentity, RequireUnlockedModule } from './guards'
import { ROUTES } from '@/lib/constants/routes'
import LandingPage from '@/pages/LandingPage'
import OnboardingPage from '@/pages/OnboardingPage'
import BriefingPage from '@/pages/BriefingPage'
import DashboardPage from '@/pages/DashboardPage'
import ModulePage from '@/pages/ModulePage'
import FinalBossPage from '@/pages/FinalBossPage'
import ResultsPage from '@/pages/ResultsPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.landing} element={<LandingPage />} />
      <Route path={ROUTES.onboarding} element={<OnboardingPage />} />
      <Route path={ROUTES.briefing} element={<BriefingPage />} />
      <Route path={ROUTES.settings} element={<SettingsPage />} />
      <Route element={<RequireAgentIdentity />}>
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route element={<RequireUnlockedModule />}>
          <Route path={ROUTES.module} element={<ModulePage />} />
        </Route>
        <Route path={ROUTES.finalBoss} element={<FinalBossPage />} />
        <Route path={ROUTES.results} element={<ResultsPage />} />
      </Route>
      <Route path="/home" element={<Navigate to={ROUTES.landing} replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
