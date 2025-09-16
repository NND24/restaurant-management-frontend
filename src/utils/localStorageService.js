import { get } from "lodash";

const isBrowser = typeof window !== 'undefined';
const rolePriority = ['staff', 'manager', 'owner'];
const USER_ID_KEY = 'userId';
const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';
const STORE_ID_KEY = 'storeId';
const STORE_KEY = 'store';
const ACTIVE_TAB_KEY = 'activeTab';
const ACTIVE_CONFIRMED_TAB_FILTER = 'confirmedTabFilter';
const ACTIVE_MENU_TAB = 'activeMenuTab';

const localStorageService = {
  // Setters
  setUserId: (userId) => {
    if (isBrowser) localStorage.setItem(USER_ID_KEY, JSON.stringify(userId));
  },
  setToken: (token) => {
    if (isBrowser) localStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  },
  setRole: (role) => {
    if (isBrowser) localStorage.setItem(ROLE_KEY, JSON.stringify(role));
  },
  setStoreId: (storeId) => {
    if (isBrowser) localStorage.setItem(STORE_ID_KEY, JSON.stringify(storeId));
  },
  setStore: (store) => {
    if (isBrowser) localStorage.setItem(STORE_KEY, JSON.stringify(store));
  },
  setActiveTab: (tab) => {
    if (isBrowser) localStorage.setItem(ACTIVE_TAB_KEY, JSON.stringify(tab));
  },
  setActiveFilter: (filter) => {
    if (isBrowser) localStorage.setItem(ACTIVE_CONFIRMED_TAB_FILTER, JSON.stringify(filter));
  },
  setActiveMenuTab: (filter) => {
    if (isBrowser) localStorage.setItem(ACTIVE_MENU_TAB, JSON.stringify(filter));
  },

  // Getters
  getUserId: () => {
    if (!isBrowser) return null;
    const val = localStorage.getItem(USER_ID_KEY);
    return val ? JSON.parse(val) : null;
  },
  getToken: () => {
    if (!isBrowser) return null;
    const val = localStorage.getItem(TOKEN_KEY);
    return val ? JSON.parse(val) : null;
  },
  getRole: () => {
    if (!isBrowser) return null;
    
    const val = localStorage.getItem(ROLE_KEY);
    if (!val) return null;
  
    const roles = JSON.parse(val); // assuming this is an array of roles
    if (!Array.isArray(roles)) return roles; // if it's just a string, return as is
  
    // Sort roles by their index in `rolePriority` and pick the highest
    const highestRole = roles.sort((a, b) => 
      rolePriority.indexOf(b) - rolePriority.indexOf(a)
    )[0];
  
    return highestRole || null;
  },
  getStoreId: () => {
    if (!isBrowser) return null;
    const val = localStorage.getItem(STORE_ID_KEY);
    return val ? JSON.parse(val) : null;
  },
  getStore: () => {
    if (!isBrowser) return null;
    const val = localStorage.getItem(STORE_KEY);
    return val ? JSON.parse(val) : null;
  },
  getActiveTab: () => {
    if (!isBrowser) return null;
    const val = localStorage.getItem(ACTIVE_TAB_KEY);
    return val ? JSON.parse(val) : null;
  },
  getActiveFilter: () => {
    if (!isBrowser) return null;
    const val = localStorage.getItem(ACTIVE_CONFIRMED_TAB_FILTER);
    return val ? JSON.parse(val) : null;
  },
  getActiveMenuTab: () => {
    if (!isBrowser) return null;
    const val = localStorage.getItem(ACTIVE_MENU_TAB);
    return val ? JSON.parse(val) : null;
  },

  // Clear All
  clearAll: () => {
    if (isBrowser) {
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(STORE_ID_KEY);
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(ACTIVE_TAB_KEY);
      localStorage.removeItem(ACTIVE_CONFIRMED_TAB_FILTER);
      localStorage.removeItem(ACTIVE_MENU_TAB);
    }
  }
};

export default localStorageService;
