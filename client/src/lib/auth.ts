import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiRequest } from './queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  isEmailConfirmed: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          console.log('login', { email, password });
          const response = await apiRequest('/api/auth/login', {
            method: 'POST',
            data: { email, password },
          });

          if (response.success) {
            set({ 
              user: response.user, 
              token: response.token,
              isAuthenticated: true 
            });
            return { success: true };
          } else {
            return { success: false, error: response.message };
          }
        } catch (error) {
          console.error('Login error:', error);
          return { success: false, error: 'Login failed' };
        }
      },
      register: async (username: string, email: string, password: string) => {
        try {
          const response = await apiRequest('/api/auth/register', {
            method: 'POST',
            data: { username, email, password },
          });

          return { 
            success: response.success, 
            error: response.success ? undefined : response.message 
          };
        } catch (error) {
          console.error('Registration error:', error);
          return { success: false, error: 'Registration failed' };
        }
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);