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

const safeParse = (val) => {
  if (!val || val === "undefined" || val === "null") return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
};

const safeSet = (key, value) => {
  if (!isBrowser) return;
  if (value === undefined || value === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const localStorageService = {
  // Setters
  setUserId: (userId) => safeSet(USER_ID_KEY, userId),
  setToken: (token) => safeSet(TOKEN_KEY, token),
  setRole: (role) => safeSet(ROLE_KEY, role),
  setStoreId: (storeId) => safeSet(STORE_ID_KEY, storeId),
  setStore: (store) => safeSet(STORE_KEY, store),
  setActiveTab: (tab) => safeSet(ACTIVE_TAB_KEY, tab),
  setActiveFilter: (filter) => safeSet(ACTIVE_CONFIRMED_TAB_FILTER, filter),
  setActiveMenuTab: (filter) => safeSet(ACTIVE_MENU_TAB, filter),

  // Getters
  getUserId: () => {
    if (!isBrowser) return null;
    return safeParse(localStorage.getItem(USER_ID_KEY));
  },
  getToken: () => {
    if (!isBrowser) return null;
    return safeParse(localStorage.getItem(TOKEN_KEY));
  },
  getRole: () => {
    if (!isBrowser) return null;

    const roles = safeParse(localStorage.getItem(ROLE_KEY));
    if (!roles) return null;
    if (!Array.isArray(roles)) return roles;

    // Sort roles by their index in `rolePriority` and pick the highest
    const highestRole = roles.sort((a, b) =>
      rolePriority.indexOf(b) - rolePriority.indexOf(a)
    )[0];

    return highestRole || null;
  },
  getStoreId: () => {
    if (!isBrowser) return null;
    return safeParse(localStorage.getItem(STORE_ID_KEY));
  },
  getStore: () => {
    if (!isBrowser) return null;
    return safeParse(localStorage.getItem(STORE_KEY));
  },
  getActiveTab: () => {
    if (!isBrowser) return null;
    return safeParse(localStorage.getItem(ACTIVE_TAB_KEY));
  },
  getActiveFilter: () => {
    if (!isBrowser) return null;
    return safeParse(localStorage.getItem(ACTIVE_CONFIRMED_TAB_FILTER));
  },
  getActiveMenuTab: () => {
    if (!isBrowser) return null;
    return safeParse(localStorage.getItem(ACTIVE_MENU_TAB));
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
