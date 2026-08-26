import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AppLayout } from "@/app/layout";
import { LoadingScreen } from "@/shared/components/loading-screen";
import { useAuth } from "@/modules/auth/use-auth";

const AuditPage = lazy(() => import("@/modules/audit/page"));
const LoginPage = lazy(() => import("@/modules/auth/login-page"));
const DashboardPage = lazy(() => import("@/modules/dashboard/page"));
const FarmsPage = lazy(() => import("@/modules/farms/page"));
const HarvestsPage = lazy(() => import("@/modules/harvests/page"));
const ProducersPage = lazy(() => import("@/modules/producers/page"));

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

function PublicAuthRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}

export function AppRoutes() {
  const { user, loading } = useAuth();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/login" element={<PublicAuthRoute />} />

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/producers" element={<ProducersPage />} />
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/harvests" element={<HarvestsPage />} />
          <Route path="/audit" element={<AuditPage />} />
        </Route>

        {/* Root redirect */}
        <Route
          path="/"
          element={
            loading ? (
              <div className="bg-background flex min-h-screen items-center justify-center" />
            ) : user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch-all redirect */}
        <Route
          path="*"
          element={
            loading ? null : user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Suspense>
  );
}
