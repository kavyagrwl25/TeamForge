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
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { checkAuth as checkAuthService } from "./services/authServices";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        await checkAuthService();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkUserSession();
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        Checking your session...
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && <Navbar onLogout={handleLogout} />}
      <Routes>
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
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Settings onAccountDeleted={handleLogout} />
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
    </>
  );
}

export default App;
