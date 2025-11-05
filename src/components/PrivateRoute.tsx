import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: number[];
}

interface JWTPayload {
  role?: number | string;
  exp?: number;
  [key: string]: any;
}

const PrivateRoute = ({ children, allowedRoles }: PrivateRouteProps) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode<JWTPayload>(token);

    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      localStorage.removeItem("token");
      return <Navigate to="/" state={{ from: location }} replace />;
    }

    const userRole =
      typeof decoded.role === "string" ? parseInt(decoded.role, 10) : decoded.role;

    if (userRole == null || Number.isNaN(userRole)) {
      // Unknown or invalid role: treat as unauthenticated
      localStorage.removeItem("token");
      return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole ?? -1)) {
      return <Navigate to="/" replace />;
    }

    return <>{children}</>;
  } catch (err) {
    console.error("Invalid token:", err);
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }
};

export default PrivateRoute;
