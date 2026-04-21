import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChangePassword from "./pages/ChangePassword";
import CreateProject from "./pages/CreateProject";
import EditProject from "./pages/EditProject";
import ExploreProjects from "./pages/ExploreProjects";
import MyProjects from "./pages/MyProjects";
import MySentRequests from "./pages/MySentRequests";
import ProjectRequests from "./pages/ProjectRequests";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import {
  checkAuth as checkAuthService,
  checkPublicAuth,
  clearAuthSessionHint,
  hasAuthSessionHint,
  markAuthSessionKnown,
  setAuthFailureHandler,
} from "./services/authServices";

const publicRoutes = ["/login", "/register"];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    publicRoutes.includes(window.location.pathname) ? false : null
  );
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const removeAuthFailureHandler = setAuthFailureHandler(() => {
      setCurrentUser(null);
      setIsAuthenticated(false);
      clearAuthSessionHint();
      navigate("/login", { replace: true });
    });

    const checkUserSession = async () => {
      if (publicRoutes.includes(location.pathname)) {
        setIsAuthenticated(false);

        if (!hasAuthSessionHint()) {
          // Public route handling: first-time visitors should see /login or
          // /register immediately. With no frontend session hint, we skip
          // /users/me entirely to avoid noisy logged-out 401 responses.
          setCurrentUser(null);
          return;
        }

        try {
          // Public route handling: /login and /register are allowed to load
          // without a valid session. This quiet check only redirects users who
          // are already authenticated, and it never calls refresh-tokens.
          const response = await checkPublicAuth();
          setCurrentUser(response.data);
          markAuthSessionKnown();
          setIsAuthenticated(true);
        } catch {
          // A 401 here usually means "visitor is not logged in", which is
          // normal on public pages and should not be treated as a fatal error.
          setCurrentUser(null);
          setIsAuthenticated(false);
          clearAuthSessionHint();
        }

        return;
      }

      setIsAuthenticated(null);

      try {
        // Protected route handling: protected pages use the normal auth check.
        // If access token is expired, the axios interceptor may refresh it.
        const response = await checkAuthService();
        setCurrentUser(response.data);
        markAuthSessionKnown();
        setIsAuthenticated(true);
      } catch {
        setCurrentUser(null);
        setIsAuthenticated(false);
        clearAuthSessionHint();
      }
    };

    checkUserSession();

    return removeAuthFailureHandler;
  }, [location.pathname, navigate]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    markAuthSessionKnown();
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearAuthSessionHint();
    setIsAuthenticated(false);
  };

  const handleProfileUpdated = (user) => {
    setCurrentUser(user);
  };

  if (!isPublicRoute && isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] text-slate-300">
        Checking your session...
      </div>
    );
  }

  return (
    // Root background: one dark premium gradient now covers every route and future page.
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] text-slate-100">
      {/* Subtle radial glows add depth while keeping the dashboard calm and readable. */}
      <div className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      {isAuthenticated && (
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
      )}
      <main className="relative z-10 flex-1">
        <Routes>
          {/* Redirect decision happens here for the app's default screen. */}
          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? "/projects/explore" : "/login"}
                replace
              />
            }
          />
          {/* Redirect after an authenticated user visits /login. */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/projects/explore" replace />
              ) : (
                <Login onLoginSuccess={handleLoginSuccess} />
              )
            }
          />
          {/* Redirect after an authenticated user visits /register. */}
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/projects/explore" replace />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Navigate to="/projects/explore" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/me"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/explore"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ExploreProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/create"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/edit"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <EditProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/me"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MySentRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/requests"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ProjectRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Profile currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Settings
                  onAccountDeleted={handleLogout}
                  onProfileUpdated={handleProfileUpdated}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Settings
                  onAccountDeleted={handleLogout}
                  onProfileUpdated={handleProfileUpdated}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/projects/explore" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default App;
