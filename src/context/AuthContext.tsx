import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    return null;
  });

  const [loading] = useState<boolean>(false);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    try {
      const res = await client.post('/login/', { email, password });
      const { token: jwt, ...userData } = res.data;
      setToken(jwt);
      setUser(userData);
      localStorage.setItem('token', jwt);
      localStorage.setItem('user', JSON.stringify(userData));
      toast.success(`Welcome back, ${userData.first_name}!`);
      return userData;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } };
      const msg =
        errorObj.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  }, []);

  const isAdmin = user?.admin === true;
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAdmin, isAuthenticated, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
