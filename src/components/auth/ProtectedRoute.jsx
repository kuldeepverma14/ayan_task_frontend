import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { XCircle } from 'lucide-react';
import DashboardLayout from '../../layout/DashboardLayout';

const ProtectedRoute = ({ children, permissionPath, action = 'canView' }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permissionPath && !hasPermission(permissionPath, action)) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 max-w-md">
            You don't have permission to view this page. Please contact your system administrator.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return children;
};

export default ProtectedRoute;
