import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/PrivateRoute";
import { authService } from "@/services/authService";

import Index from "./pages/Index";
import PatientOnboarding from "./pages/PatientOnboarding";
import PatientDashboard from "./pages/PatientDashboard";
import ResearcherOnboarding from "./pages/ResearcherOnboarding";
import ResearcherDashboard from "./pages/ResearcherDashboard";
import ClinicalTrials from "./pages/ClinicalTrials";
import Experts from "./pages/Experts";
import Publications from "./pages/Publications";
import Favorites from "./pages/Favorites";
import Forums from "./pages/Forums";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/User";
import { useEffect, useState } from "react";
import { PatientProfile } from "./pages/PatientProfile";
import { ResearcherProfile } from "./pages/ResearcherProfile";
// import PublicRoute from "./components/PublicRoute";

const queryClient = new QueryClient();

const App = () => {

  const [user, setUser] = useState<Number>()

  useEffect(() => {
    const syncUserRole = () => {
      const userRole = localStorage.getItem("role");
      setUser(userRole !== null ? Number(userRole) : undefined);
    };
    syncUserRole();
    window.addEventListener("authChange", syncUserRole);
    return () => window.removeEventListener("authChange", syncUserRole);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                user === 0 ? (
                  <Navigate to="/patient-dashboard" replace />
                ) : user === 1 ? (
                  <Navigate to="/researcher-dashboard" replace />
                ) : (
                  <Index />
                )
              }
            />
            <Route path="/user" element={<UserProfile />} />
            {/* Protected Routes patient */}
            <Route path="/patient-onboarding" element={
              <PrivateRoute allowedRoles={[0]}>
                <PatientOnboarding /></PrivateRoute>
            }
            />
            <Route
              path="/patient-dashboard"
              element={
                <PrivateRoute allowedRoles={[0]}>
                  <PatientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/experts"
              element={
                <PrivateRoute allowedRoles={[0]}>
                  <Experts />
                </PrivateRoute>
              }
            />
            {/* Protected Routes researcher */}
            <Route path="/researcher-onboarding" element={
              <PrivateRoute allowedRoles={[1]}>
                <ResearcherOnboarding />
              </PrivateRoute>
            }
            />
            <Route
              path="/researcher-dashboard"
              element={
                <PrivateRoute allowedRoles={[1]}>
                  <ResearcherDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/publications"
              element={
                <PrivateRoute allowedRoles={[1]}>
                  <Publications />
                </PrivateRoute>
              }
            />
            {/* Protected Routes common */}
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={[0, 1]}>
                  {user === 1 ? <ResearcherProfile /> : <PatientProfile />}
                </PrivateRoute>
              }
            />
            <Route
              path="/clinical-trials"
              element={
                <PrivateRoute allowedRoles={[0, 1]}>
                  <ClinicalTrials />
                </PrivateRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <PrivateRoute allowedRoles={[0, 1]}>
                  <Favorites />
                </PrivateRoute>
              }
            />
            <Route
              path="/forums"
              element={
                <PrivateRoute allowedRoles={[0, 1]}>
                  <Forums />
                </PrivateRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
