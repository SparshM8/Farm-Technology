import React, { useState } from 'react';
import './Header.css';

export default function Header({ cartCount, onCartClick, user, onAuthClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return <header className="header"><div className="container"><div className="header-top"><a className="logo" href="#home" aria-label="Farming Tech Shop home"><h1>🌾 Farming Tech Shop</h1></a><button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="Toggle navigation">☰</button><nav className={`nav ${menuOpen ? 'open' : ''}`}><a href="#home">Home</a><a href="#products">Products</a><a href="#contact">Contact</a></nav><div className="header-actions"><button className="account-btn" onClick={user ? onLogout : onAuthClick}>{user ? `Hi, ${user.name?.split(' ')[0] || 'Farmer'} · Sign out` : 'Sign in'}</button><button className="cart-trigger" onClick={onCartClick} aria-label={`Open cart with ${cartCount} items`}>Cart <span>{cartCount}</span></button></div></div></div></header>;
}
