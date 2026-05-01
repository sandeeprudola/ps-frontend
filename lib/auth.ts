export type AuthRole = 'user' | 'admin' | 'employee' | 'any';

const USER_TOKEN_KEY = 'token';
const ADMIN_TOKEN_KEY = 'ADMIN_TOKEN';
const EMPLOYEE_TOKEN_KEY = 'EMPLOYEE_TOKEN';

const canUseStorage = () => typeof window !== 'undefined';

export const getStoredToken = (role: AuthRole = 'any') => {
  if (!canUseStorage()) return null;

  if (role === 'user') {
    return localStorage.getItem(USER_TOKEN_KEY);
  }

  if (role === 'admin') {
    return (
      localStorage.getItem(ADMIN_TOKEN_KEY) ?? localStorage.getItem(USER_TOKEN_KEY)
    );
  }

  if (role === 'employee') {
    return (
      localStorage.getItem(EMPLOYEE_TOKEN_KEY) ?? localStorage.getItem(USER_TOKEN_KEY)
    );
  }

  return (
    localStorage.getItem(ADMIN_TOKEN_KEY) ??
    localStorage.getItem(EMPLOYEE_TOKEN_KEY) ??
    localStorage.getItem(USER_TOKEN_KEY)
  );
};

export const createAuthHeaders = (role: AuthRole = 'any') => {
  const token = getStoredToken(role);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const setUserToken = (token: string) => {
  if (!canUseStorage()) return;
  localStorage.setItem(USER_TOKEN_KEY, token);
};

export const setAdminToken = (token: string) => {
  if (!canUseStorage()) return;
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const setEmployeeToken = (token: string) => {
  if (!canUseStorage()) return;
  localStorage.setItem(USER_TOKEN_KEY, token);
  localStorage.setItem(EMPLOYEE_TOKEN_KEY, token);
};

export const clearStoredTokens = () => {
  if (!canUseStorage()) return;
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(EMPLOYEE_TOKEN_KEY);
};
