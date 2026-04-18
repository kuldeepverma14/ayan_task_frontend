import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import API_ENDPOINTS from '../api/endpoints';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Authority Validator
   */
  const hasPermission = useCallback((path) => {
    if (!user) return false;
    if (user.role?.name === 'SUPER_ADMIN') return true;
    if (!path || path === '/' || path === '/dashboard') return true;

    const permissions = user.activePermissions || [];
    const permission = permissions.find(p => p.page?.path === path);
    return permission?.canView === true;
  }, [user]);

  /**
   * Universal Sync: Identity + Registry
   * This is the single source of truth for 'Ready' state
   */
  const syncSovereignty = async () => {
    try {
      const [profileRes, navRes] = await Promise.all([
        api.get(API_ENDPOINTS.AUTH.ME),
        api.get(API_ENDPOINTS.MODULES.SIDEBAR)
      ]);

      const profile = profileRes.data.data;
      const navData = navRes.data.data || [];

      if (profile.isAuthenticated) {
        setUser(profile.user);
        setIsAuthenticated(true);
        setNavigation(navData);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  /**
   * Initial Mount Sync
   */
  useEffect(() => {
    const init = async () => {
      await syncSovereignty();
      setLoading(false);
    };
    init();
  }, []);

  /**
   * LOGIN FLOW:
   * Perform pure login, then force a full Sovereignty Sync
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      // 1. Authenticate & Capture Token
      const loginRes = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const { accessToken } = loginRes.data.data;
      
      // Store token for Header Sovereignty
      localStorage.setItem('accessToken', accessToken);

      // 2. Hydrate Full Profile & Registry
      const success = await syncSovereignty();

      if (!success) {
        localStorage.removeItem('accessToken');
        throw new Error("Profile hydration failed");
      }

      return { success: true };
    } catch (err) {
      setLoading(false);
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed'
      };
    } finally {
      setTimeout(() => setLoading(false), 100);
    }
  };

  const logout = async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
      setNavigation([]);
      window.location.href = '/login';
    }
  };

  const value = {
    user,
    navigation,
    navModules: navigation,
    loading,
    isAuthenticated,
    hasPermission,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
