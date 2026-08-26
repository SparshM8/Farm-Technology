import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';

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

  const request = async (path, options = {}) => {
    const response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Cart request failed');
    return data;
  };

  const loadServerCart = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await request('/api/cart');
      setItems(data.cart.items || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setItems(readGuestCart());
      return;
    }
    const syncGuestCart = async () => {
      const guestItems = readGuestCart();
      try {
        await Promise.all(guestItems.map((item) => request('/api/cart/items', {
          method: 'POST',
          body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
        })));
        localStorage.removeItem(GUEST_CART_KEY);
      } catch (syncError) {
        setError(syncError.message);
      }
      loadServerCart();
    };
    syncGuestCart();
  }, [authLoading, token]);

  const updateGuest = (next) => {
    setItems(next);
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
  };

  const addToCart = async (product) => {
    setError('');
    if (token) {
      await request('/api/cart/items', { method: 'POST', body: JSON.stringify({ productId: product.id, quantity: 1 }) });
      await loadServerCart();
      return;
    }
    const existing = items.find((item) => item.productId === product.id);
    const next = existing
      ? items.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item)
      : [...items, { id: product.id, productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }];
    updateGuest(next);
  };

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return removeItem(item);
    if (token) {
      await request(`/api/cart/items/${item.id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
      await loadServerCart();
      return;
    }
    updateGuest(items.map((current) => current.productId === item.productId ? { ...current, quantity: Math.min(quantity, current.stock || quantity) } : current));
  };

  const removeItem = async (item) => {
    if (token) {
      await request(`/api/cart/items/${item.id}`, { method: 'DELETE' });
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
