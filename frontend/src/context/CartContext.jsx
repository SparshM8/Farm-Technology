import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';
import { addGuestCartItem, setGuestItemQuantity } from '../lib/guestCart';

const CartContext = createContext(null);
const GUEST_CART_KEY = 'farmingTechGuestCart';

const readGuestCart = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const { token, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const syncedTokenRef = useRef(null);

  const loadServerCart = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await api.cart.get(token);
      setItems(data.cart.items || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      syncedTokenRef.current = null;
      setItems(readGuestCart());
      setLoading(false);
      return;
    }

    let active = true;
    const syncGuestCart = async () => {
      if (syncedTokenRef.current === token) {
        await loadServerCart();
        return;
      }
      syncedTokenRef.current = token;
      const guestItems = readGuestCart();
      try {
        if (guestItems.length) {
          await Promise.all(guestItems.map((item) => api.cart.add(token, item.productId, item.quantity)));
          localStorage.removeItem(GUEST_CART_KEY);
        }
      } catch (syncError) {
        if (active) setError(syncError.message);
      }
      if (active) await loadServerCart();
    };
    syncGuestCart();
    return () => {
      active = false;
    };
  }, [authLoading, token, loadServerCart]);

  const updateGuest = (next) => {
    setItems(next);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
  };

  const addToCart = async (product) => {
    setError('');
    if (token) {
      await api.cart.add(token, product.id, 1);
      await loadServerCart();
      return;
    }
    updateGuest(addGuestCartItem(items, product));
  };

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return removeItem(item);
    if (token) {
      await api.cart.update(token, item.id, quantity);
      await loadServerCart();
      return;
    }
    updateGuest(setGuestItemQuantity(items, item.productId, quantity));
  };

  const removeItem = async (item) => {
    if (token) {
      await api.cart.remove(token, item.id);
      await loadServerCart();
      return;
    }
    updateGuest(items.filter((current) => current.productId !== item.productId));
  };

  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const value = useMemo(() => ({ items, total, itemCount, loading, error, isServerCart: Boolean(token), addToCart, updateQuantity, removeItem }), [items, total, itemCount, loading, error, token]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
