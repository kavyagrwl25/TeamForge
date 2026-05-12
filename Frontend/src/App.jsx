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
  clearFallbackAccessToken,
  markAuthSessionKnown,
  setAuthFailureHandler,
  setGlobalApiErrorHandler,
} from "./services/authServices";
import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./services/notificationServices";
import { socket } from "./socket/socket";
import {
  getApiErrorMessage,
  isRateLimitError,
} from "./utils/apiErrorHelpers";

const publicRoutes = ["/login", "/register"];

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isPublicRoute = publicRoutes.includes(location.pathname);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [apiFeedback, setApiFeedback] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState(null);
  const [notificationsReloadToken, setNotificationsReloadToken] = useState(0);
  const [activeNotificationId, setActiveNotificationId] = useState(null);
  const [markAllNotificationsLoading, setMarkAllNotificationsLoading] =
    useState(false);
  const [notificationToast, setNotificationToast] = useState(null);
  const resetNotificationState = () => {
    setNotifications([]);
    setNotificationsError(null);
    setNotificationsLoading(false);
    setNotificationsReloadToken(0);
    setActiveNotificationId(null);
    setMarkAllNotificationsLoading(false);
  };

  useEffect(() => {
    const removeAuthFailureHandler = setAuthFailureHandler(() => {
      setCurrentUser(null);
      setIsAuthenticated(false);
      setAuthLoading(false);
      resetNotificationState();
      clearFallbackAccessToken();
      clearAuthSessionHint();
      navigate("/login", { replace: true });
    });
    const removeGlobalApiErrorHandler = setGlobalApiErrorHandler((payload) => {
      setApiFeedback(payload);
    });

    const hydrateAuth = async () => {
      setAuthLoading(true);
      try {
        const response = publicRoutes.includes(window.location.pathname)
          ? await checkPublicAuth()
          : await checkAuthService();

        setCurrentUser(response.data);
        markAuthSessionKnown();
        setIsAuthenticated(true);
      } catch (error) {
        if (isRateLimitError(error)) {
          setIsAuthenticated(Boolean(currentUser));
        } else {
          setCurrentUser(null);
          setIsAuthenticated(false);
          resetNotificationState();
          clearFallbackAccessToken();
          clearAuthSessionHint();
        }
      } finally {
        setAuthLoading(false);
      }
    };

    hydrateAuth();

    return () => {
      removeAuthFailureHandler();
      removeGlobalApiErrorHandler();
    };
  }, [navigate]);

  useEffect(() => {
    if (!apiFeedback) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setApiFeedback((currentFeedback) =>
        currentFeedback?.id === apiFeedback.id ? null : currentFeedback
      );
    }, 4500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [apiFeedback]);

  useEffect(() => {
    if (!currentUser?._id) {
      return undefined;
    }

    let isActive = true;

    const loadNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError(null);

      try {
        const response = await getNotifications();
        const nextNotifications = Array.isArray(response?.data)
          ? response.data
          : [];

        if (!isActive) {
          return;
        }

        setNotifications(nextNotifications);
      } catch {
        if (!isActive) {
          return;
        }

        setNotificationsError("Couldn't load notifications. Please try again.");
      } finally {
        if (isActive) {
          setNotificationsLoading(false);
        }
      }
    };

    loadNotifications();

    return () => {
      isActive = false;
    };
  }, [currentUser?._id, notificationsReloadToken]);

  useEffect(() => {
    if (!notificationToast) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setNotificationToast((currentToast) =>
        currentToast?.id === notificationToast.id ? null : currentToast
      );
    }, 3500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [notificationToast]);

  useEffect(() => {
    if (!currentUser?._id) return undefined;

    socket.auth = {
      userId: currentUser._id,
    };

    const handleNewNotification = (incomingNotification) => {
      if (!incomingNotification?._id) {
        return;
      }

      setNotifications((currentNotifications) => {
        const notificationsWithoutDuplicate = currentNotifications.filter(
          (notification) => notification._id !== incomingNotification._id
        );

        return [incomingNotification, ...notificationsWithoutDuplicate];
      });
      setNotificationToast({
        id: Date.now(),
        message:
          incomingNotification.message || "You have a new notification.",
        tone: "info",
      });
    };

    socket.connect();
    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.disconnect();
    };
  }, [currentUser?._id]);

  const unreadNotificationCount = notifications.reduce(
    (count, notification) => (notification?.isRead ? count : count + 1),
    0
  );

  const handleRetryNotifications = () => {
    setNotificationsReloadToken((currentValue) => currentValue + 1);
  };

  const handleNotificationClick = async (notificationId) => {
    const selectedNotification = notifications.find(
      (notification) => notification._id === notificationId
    );

    if (!notificationId || !selectedNotification) {
      return;
    }

    const notificationProjectId =
      selectedNotification.data?.projectId?._id ||
      selectedNotification.data?.projectId;

    const destination =
      selectedNotification.type === "NEW_REQUEST" && notificationProjectId
        ? `/projects/${notificationProjectId}/requests`
        : "/requests/me";

    if (selectedNotification.isRead) {
      navigate(destination);
      return;
    }

    setActiveNotificationId(notificationId);

    try {
      const response = await markNotificationAsRead(notificationId);
      const updatedNotification = response?.data;

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                ...(updatedNotification || {}),
                isRead: true,
              }
            : notification
        )
      );
      navigate(destination);
    } catch (error) {
      setNotificationToast({
        id: Date.now(),
        message: getApiErrorMessage(
          error,
          "Unable to mark this notification as read."
        ),
        tone: "error",
      });
    } finally {
      setActiveNotificationId(null);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    if (!unreadNotificationCount) {
      return;
    }

    setMarkAllNotificationsLoading(true);

    try {
      await markAllNotificationsAsRead();
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.isRead
            ? notification
            : { ...notification, isRead: true }
        )
      );
    } catch (error) {
      setNotificationToast({
        id: Date.now(),
        message: getApiErrorMessage(
          error,
          "Unable to mark all notifications as read."
        ),
        tone: "error",
      });
    } finally {
      setMarkAllNotificationsLoading(false);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    markAuthSessionKnown();
    setIsAuthenticated(true);
    setAuthLoading(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    resetNotificationState();
    clearFallbackAccessToken();
    clearAuthSessionHint();
    setIsAuthenticated(false);
    setAuthLoading(false);
  };

  const handleProfileUpdated = (user) => {
    setCurrentUser(user);
  };

  if (!isPublicRoute && authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] text-slate-300">
        Checking your session...
      </div>
    );
  }

  return (
    // Root background: one dark premium gradient now covers every route and future page.
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] text-slate-100">
      {/* Subtle radial glows add depth while keeping the dashboard calm and readable. */}
      <div className="pointer-events-none fixed -left-32 top-24 h-80 w-80 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-20 right-0 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      {apiFeedback && (
        <div className="pointer-events-none fixed right-4 top-4 z-50 max-w-sm px-4 sm:right-6 sm:top-6">
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-auto rounded-2xl border border-rose-300/25 bg-slate-950/90 px-4 py-3 text-sm text-slate-100 shadow-2xl shadow-slate-950/40 backdrop-blur"
          >
            {apiFeedback.message}
          </div>
        </div>
      )}
      {notificationToast && (
        <div className="pointer-events-none fixed right-4 top-20 z-50 max-w-sm px-4 sm:right-6 sm:top-24">
          <div
            role="status"
            aria-live="polite"
            className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
              notificationToast.tone === "error"
                ? "border-rose-300/25 bg-rose-950/90 text-rose-100 shadow-rose-950/30"
                : "border-sky-300/20 bg-slate-950/90 text-slate-100 shadow-slate-950/40"
            }`}
          >
            {notificationToast.message}
          </div>
        </div>
      )}
      {isAuthenticated && (
        <Navbar
          currentUser={currentUser}
          notifications={notifications}
          unreadNotificationCount={unreadNotificationCount}
          notificationsLoading={notificationsLoading}
          notificationsError={notificationsError}
          onRetryNotifications={handleRetryNotifications}
          onNotificationClick={handleNotificationClick}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          activeNotificationId={activeNotificationId}
          markAllNotificationsLoading={markAllNotificationsLoading}
          onLogout={handleLogout}
        />
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
              authLoading ? (
                <div className="flex min-h-screen items-center justify-center text-slate-300">
                  Checking your session...
                </div>
              ) : isAuthenticated ? (
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
              authLoading ? (
                <div className="flex min-h-screen items-center justify-center text-slate-300">
                  Checking your session...
                </div>
              ) : isAuthenticated ? (
                <Navigate to="/projects/explore" replace />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
                <Navigate to="/projects/explore" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/me"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
                <MyProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/explore"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
                <ExploreProjects />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/create"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/edit"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
                <EditProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/me"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
                <MySentRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/requests"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
                <ProjectRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
                <Profile currentUser={currentUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
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
              <ProtectedRoute isLoading={authLoading} user={currentUser}>
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
