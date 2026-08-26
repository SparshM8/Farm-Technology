import React, { useState } from 'react';
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
import { useCatalog } from './hooks/useCatalog';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount, addToCart } = useCart();
  const { products, categories, loading, error } = useCatalog({ category: selectedCategory, query: searchQuery });

  const handleAddToCart = async (product) => {
    await addToCart(product);
    setCartOpen(true);
  };

  return <div className="App"><Header cartCount={itemCount} onCartClick={() => setCartOpen(true)} user={user} onAuthClick={() => setAuthOpen(true)} onLogout={logout} /><main><Hero onBrowseCatalog={() => document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth' })} onOpenCart={() => setCartOpen(true)} /><Products products={products} categories={categories} selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} searchQuery={searchQuery} onSearchChange={setSearchQuery} loading={loading} error={error} onAddToCart={handleAddToCart} /><Contact /></main><Footer /><CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onAuthenticate={() => { setCartOpen(false); setAuthOpen(true); }} /><AuthModal open={authOpen} onClose={() => setAuthOpen(false)} /></div>;
}
