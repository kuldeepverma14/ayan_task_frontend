

const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    ME: '/auth/me',
  },

  // User Management
  USERS: {
    BASE: '/users',
    ROLES: '/users/roles',
    TOGGLE_STATUS: (id) => `/users/${id}/status`,
    DELETE: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    PERMISSIONS: (id) => `/user-permissions/${id}/permissions`,
  },

  // Role & Permission Management
  ROLES: {
    BASE: '/roles',
    GET_ONE: (id) => `/roles/${id}`,
    UPDATE_PERMISSIONS: (id) => `/roles/${id}/permissions`,
  },

  // Module & Page Management (ARCHITECTURE CONSOLE)
  MODULES: {
    BASE: '/modules',
    SIDEBAR: '/modules',
    REORDER: '/modules/reorder',
    DELETE: (id) => `/modules/${id}`,

    // Sub-Pages
    CREATE_PARENT: '/modules/parent',
    CREATE_PAGE: '/modules/page',
    REORDER_PAGES: '/modules/pages/reorder',
    DELETE_PAGE: (id) => `/modules/pages/${id}`,
    UPDATE_PAGE: (id) => `/modules/page/${id}`,
  },

  // Reporting & Audit
  AUDIT: {
    BASE: '/audit-logs',
  },

  // Dashboard & Activity
  DASHBOARD: {
    STATS: '/dashboard/stats',
    ACTIVITY: '/dashboard/activity',
  }
};

export default API_ENDPOINTS;
