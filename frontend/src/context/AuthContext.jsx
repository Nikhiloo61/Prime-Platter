import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { disconnectSocket, initSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('prime_platter_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details on boot if token exists
  const fetchMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      if (data.success && data.user) {
        setUser(data.user);
        initSocket();
      } else {
        logout();
      }
    } catch (err) {
      // If token expired or invalid
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success && data.token) {
      localStorage.setItem('prime_platter_token', data.token);
      setToken(data.token);
      setUser(data.user);
      initSocket();
      return data.user;
    }
    throw new Error(data.message || 'Login failed');
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success && data.token) {
      localStorage.setItem('prime_platter_token', data.token);
      setToken(data.token);
      setUser(data.user);
      initSocket();
      return data.user;
    }
    throw new Error(data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('prime_platter_token');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    if (data.success && data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.message || 'Failed to update profile');
  };

  const addAddress = async (address) => {
    const { data } = await api.post('/auth/address', address);
    if (data.success && data.addresses) {
      setUser((prev) => (prev ? { ...prev, addresses: data.addresses } : prev));
      return data.addresses;
    }
    throw new Error(data.message || 'Failed to add address');
  };

  const deleteAddress = async (addressId) => {
    const { data } = await api.delete(`/auth/address/${addressId}`);
    if (data.success && data.addresses) {
      setUser((prev) => (prev ? { ...prev, addresses: data.addresses } : prev));
      return data.addresses;
    }
    throw new Error(data.message || 'Failed to delete address');
  };

  const setDefaultAddress = async (addressId) => {
    const { data } = await api.put(`/auth/address/${addressId}/default`);
    if (data.success && data.addresses) {
      setUser((prev) => (prev ? { ...prev, addresses: data.addresses } : prev));
      return data.addresses;
    }
    throw new Error(data.message || 'Failed to set default address');
  };

  const isAdmin = user?.role === 'admin';
  const isRestaurantOwner = user?.role === 'restaurant_owner';
  const isDeliveryPartner = user?.role === 'delivery_partner';
  const isCustomer = user?.role === 'customer' || !user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        isAdmin,
        isRestaurantOwner,
        isDeliveryPartner,
        isCustomer,
        refreshUser: fetchMe,
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
