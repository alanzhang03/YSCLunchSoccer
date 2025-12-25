'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login, logout, signup } from '@/lib/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await getCurrentUser();
      setUser(data?.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (phoneNum, email, name, password, skill) => {
    const data = await signup(phoneNum, email, name, password, skill);
    setUser(data.user);
    return data;
  };

  const handleLogin = async (phoneNum, password, rememberMe = false) => {
    const data = await login(phoneNum, password, rememberMe);
    setUser(data.user);
    return data;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup: handleSignup,
        login: handleLogin,
        logout: handleLogout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
