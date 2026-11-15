import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    tax: 0,
    totalAmount: 0,
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coupon, setCoupon] = useState(null); // { code: 'WELCOME50', discount: 50, type: 'flat' }
  const { user } = useAuth();
  const { success, error } = useToast();

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      if (data.success) {
        setCart({
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          tax: data.tax || 0,
          totalAmount: data.totalAmount || 0,
        });
      }
    } catch (err) {
      // console.warn('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload cart whenever user logs in or out
  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (menuItemId, quantity = 1, options = null) => {
    try {
      const { data } = await api.post('/cart', {
        menuItemId,
        quantity,
        options,
      });
      if (data.success) {
        setCart({
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          tax: data.tax || 0,
          totalAmount: data.totalAmount || 0,
        });
        success(data.message || 'Item added to cart');
        return true;
      }
    } catch (err) {
      error(err.message || 'Could not add item to cart');
      return false;
    }
  };

  const updateQuantity = async (menuItemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${menuItemId}`, { quantity });
      if (data.success) {
        setCart({
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          tax: data.tax || 0,
          totalAmount: data.totalAmount || 0,
        });
      }
    } catch (err) {
      error(err.message || 'Could not update item quantity');
    }
  };

  const removeFromCart = async (menuItemId) => {
    try {
      const { data } = await api.delete(`/cart/${menuItemId}`);
      if (data.success) {
        setCart({
          items: data.items || [],
          subtotal: data.subtotal || 0,
          deliveryFee: data.deliveryFee || 0,
          tax: data.tax || 0,
          totalAmount: data.totalAmount || 0,
        });
        success('Item removed from cart');
      }
    } catch (err) {
      error(err.message || 'Could not remove item');
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.delete('/cart');
      if (data.success) {
        setCart({
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          tax: 0,
          totalAmount: 0,
        });
        setCoupon(null);
      }
    } catch (err) {
      error(err.message || 'Could not clear cart');
    }
  };

  const applyCoupon = (code) => {
    const cleanCode = (code || '').toUpperCase().trim();
    if (!cleanCode) {
      error('Please enter a coupon code');
      return false;
    }

    if (cart.subtotal < 199) {
      error('Minimum order of ₹199 required to apply coupons');
      return false;
    }

    if (cleanCode === 'WELCOME50' || cleanCode === 'PRIME50') {
      const discount = Math.min(Math.round(cart.subtotal * 0.5), 100);
      setCoupon({ code: cleanCode, discount, description: '50% off up to ₹100' });
      success(`Coupon ${cleanCode} applied! Saved ₹${discount}`);
      return true;
    } else if (cleanCode === 'SWIGGYIT' || cleanCode === 'TASTY20') {
      const discount = Math.min(Math.round(cart.subtotal * 0.2), 75);
      setCoupon({ code: cleanCode, discount, description: '20% off up to ₹75' });
      success(`Coupon ${cleanCode} applied! Saved ₹${discount}`);
      return true;
    } else if (cleanCode === 'FREEDEL') {
      setCoupon({ code: cleanCode, discount: cart.deliveryFee, description: 'Free Delivery' });
      success('Free delivery coupon applied!');
      return true;
    } else {
      error('Invalid coupon code. Try WELCOME50 or TASTY20');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    success('Coupon removed');
  };

  const discountAmount = coupon ? coupon.discount : 0;
  const finalPayable = Math.max(0, cart.totalAmount - discountAmount);
  const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart.items,
        subtotal: cart.subtotal,
        deliveryFee: cart.deliveryFee,
        tax: cart.tax,
        totalAmount: cart.totalAmount,
        coupon,
        discountAmount,
        finalPayable,
        totalItems,
        loading,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
