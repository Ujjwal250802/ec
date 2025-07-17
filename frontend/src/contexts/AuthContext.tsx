import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_URL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const setAuthHeaders = (authToken: string) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const clearAuthHeaders = () => {
    delete axios.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          setAuthHeaders(token);
          
          // Try to get user info from token
          const response = await api.get('/auth/me');
          setUser(response.data.user);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('token');
          setTokenState(null);
          clearAuthHeaders();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const setToken = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setTokenState(newToken);
    setAuthHeaders(newToken);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token: authToken, user: userData } = response.data;
      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/admin/login`, { email, password });
      const { token: authToken, user: userData } = response.data;
      setToken(authToken);
      setUser(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Admin login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await axios.post(`${API_URL}/auth/register`, { name, email, password });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setTokenState(null);
    setUser(null);
    clearAuthHeaders();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      adminLogin,
      register,
      logout,
      loading,
      setToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};