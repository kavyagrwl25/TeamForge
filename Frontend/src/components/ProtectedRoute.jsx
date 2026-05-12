import { Navigate, useLocation } from "react-router-dom";

function ProtectedRoute({ isAuthenticated, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    // Protected redirect happens here when a user is not logged in.
    console.log("[protected-route] redirecting to login", {
      requestId: window.__lastLoginRequestId || null,
      path: location.pathname,
      isAuthenticated,
    });
    return <Navigate to="/login" replace />;
  }

  console.log("[protected-route] allowing route", {
    requestId: window.__lastLoginRequestId || null,
    path: location.pathname,
    isAuthenticated,
  });
  return children;
}

export default ProtectedRoute;
