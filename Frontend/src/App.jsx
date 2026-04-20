import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChangePassword from "./pages/ChangePassword";
import CreateProject from "./pages/CreateProject";
import ExploreProjects from "./pages/ExploreProjects";
import MyProjects from "./pages/MyProjects";
import MySentRequests from "./pages/MySentRequests";
import ProjectRequests from "./pages/ProjectRequests";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { checkAuth as checkAuthService } from "./services/authServices";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        // Auth check happens here on every app load/refresh.
        // The backend reads the auth cookies because axios uses withCredentials.
        const response = await checkAuthService();
        setCurrentUser(response.data);
        setIsAuthenticated(true);
      } catch {
        setCurrentUser(null);
        setIsAuthenticated(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleProfileUpdated = (user) => {
    setCurrentUser(user);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        Checking your session...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {isAuthenticated && (
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
      )}
      <main className="flex-1">
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
      <Footer />
    </div>
  );
}

export default App;
