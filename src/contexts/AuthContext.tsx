import React, { createContext, useContext, useState, useCallback } from 'react';
import { getIsLoggedIn, setIsLoggedIn, getIsAdmin, setIsAdmin } from '../utils/localStorage';

interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  toggleLogin: () => void;
  loginAsAdmin: () => void;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  isAdmin: false,
  toggleLogin: () => {},
  loginAsAdmin: () => {},
  logoutAdmin: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setLoggedIn] = useState(getIsLoggedIn);
  const [isAdmin, setAdmin] = useState(getIsAdmin);

  const toggleLogin = useCallback(() => {
    setLoggedIn((prev) => {
      const next = !prev;
      setIsLoggedIn(next);
      return next;
    });
  }, []);

  const loginAsAdmin = useCallback(() => {
    setAdmin(true);
    setIsAdmin(true);
  }, []);

  const logoutAdmin = useCallback(() => {
    setAdmin(false);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, toggleLogin, loginAsAdmin, logoutAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
