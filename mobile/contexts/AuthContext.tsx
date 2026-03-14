import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import { getMe, signup, login, logout } from '@/lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  skill: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await getMe();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (
    name: string,
    email: string,
    phoneNum: string,
    password: string,
    skill: number,
  ) => {
    const data = await signup(name, email, phoneNum, password, skill);
    setUser(data);
    return data;
  };
  const handleLogin = async (identifier: string, password: string) => {
    const data = await login(identifier, password);
    setUser(data);
    return data;
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
