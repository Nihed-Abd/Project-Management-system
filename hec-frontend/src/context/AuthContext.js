import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../utils/api';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Our apiClient already handles token in interceptors
  // so we don't need to manually set headers here

  // Check if user is already logged in
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (token) {
        try {
          setLoading(true);
          const res = await apiClient.get('/auth/me');
          setCurrentUser(res.data);
          setLoading(false);
        } catch (err) {
          console.error("Authentication error:", err);
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          setToken(null);
          setCurrentUser(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.post('/auth/register', userData);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.user.role);
      setCurrentUser(res.data.user);
      setLoading(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || "Registration failed";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.post('/auth/login', { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userRole', res.data.user.role);
      setCurrentUser(res.data.user);
      setLoading(false);
      return { success: true, user: res.data.user };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || "Invalid credentials";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        token,
        register,
        login,
        logout,
        isAdmin: currentUser?.role === 'admin', // Check if user has admin role
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
