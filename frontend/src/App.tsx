import { lazy, Suspense, Component, type ReactNode } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./layouts/AppShell";
import { LoginPage } from "./pages/LoginPage";

/*
 * Every authenticated page is lazy-loaded. Route access is already gated by
 * role via <ProtectedRoute>, so a STUDENT's browser should never have to
 * download the code for HOD/Faculty/Admin-only pages (and vice versa).
 * LoginPage and the layout/auth primitives above stay eager since they're
 * needed for first paint before any auth state exists.
 */
const DashboardRouter = lazy(() =>
  import("./pages/DashboardRouter").then((m) => ({ default: m.DashboardRouter }))
);
const MarkAttendancePage = lazy(() =>
  import("./pages/MarkAttendancePage").then((m) => ({ default: m.MarkAttendancePage }))
);
const StudentsPage = lazy(() => import("./pages/StudentsPage").then((m) => ({ default: m.StudentsPage })));
const FacultyPage = lazy(() => import("./pages/FacultyPage").then((m) => ({ default: m.FacultyPage })));
const SubjectsPage = lazy(() => import("./pages/SubjectsPage").then((m) => ({ default: m.SubjectsPage })));
const DepartmentsPage = lazy(() =>
  import("./pages/DepartmentsPage").then((m) => ({ default: m.DepartmentsPage }))
);
const HodProfilePage = lazy(() =>
  import("./pages/HodProfilePage").then((m) => ({ default: m.HodProfilePage }))
);
const HodStudentsPage = lazy(() =>
  import("./pages/HodStudentsPage").then((m) => ({ default: m.HodStudentsPage }))
);
const HodFacultyPage = lazy(() =>
  import("./pages/HodFacultyPage").then((m) => ({ default: m.HodFacultyPage }))
);
const HodSubjectsPage = lazy(() =>
  import("./pages/HodSubjectsPage").then((m) => ({ default: m.HodSubjectsPage }))
);
const FacultyProfilePage = lazy(() =>
  import("./pages/FacultyProfilePage").then((m) => ({ default: m.FacultyProfilePage }))
);
const StudentProfilePage = lazy(() =>
  import("./pages/StudentProfilePage").then((m) => ({ default: m.StudentProfilePage }))
);

/*
 * Role lists as a single source of truth. Previously these were repeated as
 * inline string-literal arrays at every <ProtectedRoute roles={[...]}> call
 * site — 13 near-identical arrays with no compile-time guarantee they agree
 * with each other, and a typo in any one of them (e.g. "ADMN") would
 * silently produce an unreachable route with no type error.
 *
 * NOTE: if a `Role` union type already exists in ./context/AuthContext (or
 * elsewhere), that should be imported here instead of redeclared — I don't
 * have visibility into that file from this review, so this is defined
 * locally for now.
 */
type Role = "STUDENT" | "FACULTY" | "HOD" | "ADMIN" | "SUPER_ADMIN";

const ROLES: Record<string, Role[]> = {
  ALL_STAFF: ["FACULTY", "ADMIN", "SUPER_ADMIN", "HOD"],
  ADMIN_LEVEL: ["ADMIN", "SUPER_ADMIN", "HOD"],
  ADMIN_ONLY: ["ADMIN", "SUPER_ADMIN"],
  HOD: ["HOD"],
  FACULTY: ["FACULTY"],
  STUDENT: ["STUDENT"],
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center" role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent text-[var(--color-brand,#2f6f5e)]" />
    </div>
  );
}

function NotFoundRoute() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-[var(--color-muted,#6b6a63)]">
        The page you're looking for doesn't exist or you don't have access to it.
      </p>
      <Link to="/" className="btn-primary mt-2">
        Back to dashboard
      </Link>
    </div>
  );
}

interface RootErrorBoundaryState {
  hasError: boolean;
}

/*
 * Root-level error boundary. Without this, an uncaught render error
 * anywhere in the route tree (including inside a lazily-loaded chunk that
 * fails to fetch on a flaky connection) unmounts the entire app to a blank
 * white screen with no recovery path for the user.
 */
class RootErrorBoundary extends Component<{ children: ReactNode }, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RootErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Replace with real error reporting (Sentry, etc.) when available.
    console.error("Unhandled error in route tree:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-[var(--color-muted,#6b6a63)]">
            Please refresh the page. If the problem continues, contact support.
          </p>
          <button type="button" className="btn-primary mt-2" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route
                  element={
                    <ProtectedRoute>
                      <AppShell />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<DashboardRouter />} />

                  <Route
                    path="/mark-attendance"
                    element={
                      <ProtectedRoute roles={ROLES.ALL_STAFF}>
                        <MarkAttendancePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/students"
                    element={
                      <ProtectedRoute roles={ROLES.ADMIN_LEVEL}>
                        <StudentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/student/profile"
                    element={
                      <ProtectedRoute roles={ROLES.STUDENT}>
                        <StudentProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hod/profile"
                    element={
                      <ProtectedRoute roles={ROLES.HOD}>
                        <HodProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hod/students"
                    element={
                      <ProtectedRoute roles={ROLES.HOD}>
                        <HodStudentsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hod/faculty"
                    element={
                      <ProtectedRoute roles={ROLES.HOD}>
                        <HodFacultyPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/hod/subjects"
                    element={
                      <ProtectedRoute roles={ROLES.HOD}>
                        <HodSubjectsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/faculty"
                    element={
                      <ProtectedRoute roles={ROLES.ADMIN_ONLY}>
                        <FacultyPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/faculty/profile"
                    element={
                      <ProtectedRoute roles={ROLES.FACULTY}>
                        <FacultyProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/subjects"
                    element={
                      <ProtectedRoute roles={ROLES.ADMIN_LEVEL}>
                        <SubjectsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/departments"
                    element={
                      <ProtectedRoute roles={ROLES.ADMIN_ONLY}>
                        <DepartmentsPage />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Catch-all: previously missing entirely, so an unknown URL rendered nothing. */}
                <Route path="*" element={<NotFoundRoute />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}