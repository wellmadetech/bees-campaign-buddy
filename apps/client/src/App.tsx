import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CampaignListPage } from './pages/CampaignListPage';
import { CampaignCreatePage } from './pages/CampaignCreatePage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { CalendarPage } from './pages/CalendarPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { AssetLibraryPage } from './pages/AssetLibraryPage';
import { BundlesPage } from './pages/BundlesPage';
import { ReportingPage } from './pages/ReportingPage';
import { ScorecardPage } from './pages/ScorecardPage';
import { UsersPage } from './pages/UsersPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="campaigns" element={<CampaignListPage />} />
              <Route path="campaigns/new" element={<CampaignCreatePage />} />
              <Route path="campaigns/:id" element={<CampaignDetailPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="bundles" element={<BundlesPage />} />
              <Route path="templates" element={<TemplatesPage />} />
              <Route path="assets" element={<AssetLibraryPage />} />
              <Route path="reporting" element={<ReportingPage />} />
              <Route path="scorecard" element={<ScorecardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
