import React, { useEffect, useMemo, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Hero from './components/Hero';
import Products from './components/Products';
import Contact from './components/Contact';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount, addToCart } = useCart();

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([fetch('/api/products'), fetch('/api/products/categories/all')]);
        setProducts(productsResponse.ok ? await productsResponse.json() : []);
        setCategories(categoriesResponse.ok ? await categoriesResponse.json() : []);
      } catch (error) {
        console.error('Failed to fetch farm catalog:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const inCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query || `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query);
    return inCategory && matchesQuery;
  }), [products, selectedCategory, searchQuery]);

  const handleAddToCart = async (product) => {
    await addToCart(product);
    setCartOpen(true);
  };

  return <div className="App"><Header cartCount={itemCount} onCartClick={() => setCartOpen(true)} user={user} onAuthClick={() => setAuthOpen(true)} onLogout={logout} /><main><Hero /><Products products={filteredProducts} categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} searchQuery={searchQuery} onSearchChange={setSearchQuery} loading={loading} onAddToCart={handleAddToCart} /><Contact /></main><Footer /><CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onAuthenticate={() => { setCartOpen(false); setAuthOpen(true); }} /><AuthModal open={authOpen} onClose={() => setAuthOpen(false)} /></div>;
}
