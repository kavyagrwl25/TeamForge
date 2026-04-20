import { Navigate } from "react-router-dom";

function ProtectedRoute({ isAuthenticated, children }) {
  if (!isAuthenticated) {
    // Protected redirect happens here when a user is not logged in.
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
