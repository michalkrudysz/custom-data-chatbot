import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

const getToken = () => {
  return localStorage.getItem("token");
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = getToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
