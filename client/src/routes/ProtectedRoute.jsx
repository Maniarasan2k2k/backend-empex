import React from "react";
import { Navigate, Outlet } from "react-router-dom";

/**
 * 🔐 ROLE-BASED ACCESS CONTROL (RBAC) WRAPPER
 * 
 * Usage in App.jsx:
 * <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
 *   <Route path="/admin/users" element={<UserManagement />} />
 * </Route>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // 1. Check Authentication Status
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Check Role-Based Access
  const userRoleKey = user.role?.key;

  if (allowedRoles && !allowedRoles.includes(userRoleKey)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Render Children
  return children;
};

export default ProtectedRoute;
