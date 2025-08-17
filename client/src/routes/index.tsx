import { Routes, Route, Navigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/Layout/MainLayout';

// Import pages
import { Dashboard } from '../pages/Dashboard';
import { DataUploadPage } from '../pages/DataUploadPage';
import { AskAIPage } from '../pages/AskAIPage';
import { ForecastPage } from '../pages/ForecastPage';
import { ReportsPage } from '../pages/ReportsPage';
import { SettingsPage } from '../pages/SettingsPage';
import { SmartInsightsPage } from '../pages/SmartInsightsPage';
import { KPITrackerPage } from '../pages/KPITrackerPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes */}
      <Route
        path="/sign-in"
        element={
          <PublicRoute>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <SignIn routing="path" path="/sign-in" afterSignInUrl="/" />
            </div>
          </PublicRoute>
        }
      />
      <Route
        path="/sign-up"
        element={
          <PublicRoute>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <SignUp routing="path" path="/sign-up" afterSignUpUrl="/" />
            </div>
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <PrivateRoute>
            <DataUploadPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/insights/:dataSourceId"
        element={
          <PrivateRoute>
            <SmartInsightsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/ask-ai"
        element={
          <PrivateRoute>
            <AskAIPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/forecast"
        element={
          <PrivateRoute>
            <ForecastPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/kpi-tracker"
        element={
          <PrivateRoute>
            <KPITrackerPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <ReportsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        }
      />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;