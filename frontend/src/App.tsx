import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppShell } from "./layouts/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardRouter } from "./pages/DashboardRouter";
import { MarkAttendancePage } from "./pages/MarkAttendancePage";
import { StudentsPage } from "./pages/StudentsPage";
import { FacultyPage } from "./pages/FacultyPage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
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
                  <ProtectedRoute roles={["FACULTY", "ADMIN", "SUPER_ADMIN", "HOD"]}>
                    <MarkAttendancePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/students"
                element={
                  <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN", "HOD"]}>
                    <StudentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/faculty"
                element={
                  <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
                    <FacultyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/subjects"
                element={
                  <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN", "HOD"]}>
                    <SubjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/departments"
                element={
                  <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
                    <DepartmentsPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
