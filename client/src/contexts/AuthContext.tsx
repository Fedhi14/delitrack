import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

export interface UserAuthData {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: UserRole;
  profileId: number | null;
  isVerified?: boolean;
  verificationStatus?: string;
}

interface AuthContextType {
  user: UserAuthData | null;
  login: (userData: UserAuthData) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('delitrack_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: UserAuthData) => {
    setUser(userData);
    localStorage.setItem('delitrack_user', JSON.stringify(userData));
    localStorage.setItem('delitrack_token', userData.token); // Keep for api.ts interceptor
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('delitrack_user');
    localStorage.removeItem('delitrack_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
