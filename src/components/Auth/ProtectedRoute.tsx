import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { user, loading } = useAuth();

  // ⏳ WAIT for auth to resolve
  if (loading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  // ❌ Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authenticated
  return children;
}
