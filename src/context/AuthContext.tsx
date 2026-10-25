import { useState, useEffect, useCallback, type ReactNode } from 'react';
import client from '../api/client';
import toast from 'react-hot-toast';
import type { User } from '../types';
import { AuthContext } from './auth-context';

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

  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem('token'));

  const setSession = useCallback((jwt: string, userData: User) => {
    setToken(jwt);
    setUser(userData);
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);

  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      if (!localStorage.getItem('token')) {
        setLoading(false);
        return;
      }

      try {
        // Refreshes the cached user (e.g. email_verified) and rejects revoked tokens.
        const res = await client.get<User>('/auth/me');
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    try {
      const res = await client.post('/auth/login', { email, password });
      // The token is only ever delivered in this response; never read from anywhere else.
      const { token: jwt, ...userData } = res.data;
      setSession(jwt, userData);
      toast.success(`Welcome back, ${userData.first_name}!`);
      return userData;
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { detail?: string } } };
      const msg =
        errorObj.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw err;
    }
  }, [setSession]);

  const logout = useCallback(async () => {
    try {
      await client.post('/auth/logout'); // revokes the token server-side
    } catch {
      // Already invalid or offline: forgetting it locally is still correct.
    }
    clearSession();
    toast.success('Logged out');
  }, [clearSession]);

  const isAdmin = user?.admin === true;
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAdmin, isAuthenticated, login, logout, setSession, clearSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}
