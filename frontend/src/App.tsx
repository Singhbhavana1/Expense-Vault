import type { ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AppLayout from "@/components/layout/AppLayout";
import ForgotPassword from "@/pages/ForgotPassword";
import Categories from "@/pages/Categories";
import Dashboard from "@/pages/Dashboard";
import Expenses from "@/pages/Expenses";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Register from "@/pages/Register";
import Income from "@/pages/Income";
import Reports from "@/pages/Reports";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/income" element={<Income />} />
       
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Default */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
   <Route
  path="/forgot-password"
  element={<ForgotPassword />}
/>
        {/* Unknown route */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;