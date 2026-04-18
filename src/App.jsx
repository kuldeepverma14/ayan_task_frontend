import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import AuditLogs from './pages/AuditLogs';
import Roles from './pages/Roles';
import Modules from './pages/Modules';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute permissionPath="/users">
        <DashboardLayout>
          <Users />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/roles',
    element: (
      <ProtectedRoute permissionPath="/roles">
        <DashboardLayout>
          <Roles />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/audit-logs',
    element: (
      <ProtectedRoute permissionPath="/audit-logs">
        <DashboardLayout>
          <AuditLogs />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/modules',
    element: (
      <ProtectedRoute permissionPath="/modules">
        <DashboardLayout>
          <Modules />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute permissionPath="/settings">
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const App = () => {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: 'font-sans font-bold text-sm rounded-xl border border-slate-100 shadow-xl',
          duration: 3000,
        }}
      />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
