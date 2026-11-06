import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mobileApi, User, DEFAULT_HOST } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  backendIp: string;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBackendIp: (ip: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [backendIp, setBackendIp] = useState<string>(DEFAULT_HOST);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const savedIp = await AsyncStorage.getItem('custom_backend_ip');
      if (savedIp) setBackendIp(savedIp);

      const savedToken = await AsyncStorage.getItem('auth_token');
      const savedUser = await AsyncStorage.getItem('auth_user');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        try {
          const profile = await mobileApi.getMe();
          setUser(profile);
          await AsyncStorage.setItem('auth_user', JSON.stringify(profile));
        } catch {
          // Token expired or server unreachable
        }
      }
    } catch (e) {
      console.error('Failed to restore session', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await mobileApi.login(email, password);
    setToken(data.access_token);
    setUser(data.user);
    await AsyncStorage.setItem('auth_token', data.access_token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await mobileApi.register(name, email, password);
    setToken(data.access_token);
    setUser(data.user);
    await AsyncStorage.setItem('auth_token', data.access_token);
    await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
  };

  const updateBackendIp = async (ip: string) => {
    const clean = ip.trim();
    setBackendIp(clean);
    await AsyncStorage.setItem('custom_backend_ip', clean);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        backendIp,
        login,
        register,
        logout,
        updateBackendIp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

