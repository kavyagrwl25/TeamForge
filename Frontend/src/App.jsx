import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";
import CreateProject from "./pages/CreateProject";
import ExploreProjects from "./pages/ExploreProjects";
import MyProjects from "./pages/MyProjects";
import MySentRequests from "./pages/MySentRequests";
import ProjectRequests from "./pages/ProjectRequests";
import ProtectedRoute from "./components/ProtectedRoute";
import { checkAuth as checkAuthService } from "./services/authServices";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkUserSession = async () => {
      try {
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

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-700">
        Checking your session...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard user={currentUser} onLogout={handleLogout} />
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
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default App;
