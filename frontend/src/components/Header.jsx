import React, { useState } from 'react';
import './Header.css';

export default function Header({ cartCount, onCartClick, user, onAuthClick, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const firstName = user?.name?.trim().split(' ')[0];
  const goTo = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <div className="header-shell container">
        <a className="brand" href="#home" onClick={goTo} aria-label="Farm Technology home">
          <span className="brand-mark" aria-hidden="true"><i>F</i><i>T</i></span>
          <span><strong>Farm Technology</strong><small>Field store</small></span>
        </a>
        <button className="nav-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><span /><span /></button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          <a href="#products" onClick={goTo}>Shop supplies</a>
          <a href="#field-guide" onClick={goTo}>How it works</a>
          <a href="#contact" onClick={goTo}>Support</a>
        </nav>
        <div className="header-actions">
          {user ? <button className="account-button is-signed-in" onClick={onLogout} title="Sign out"><span className="account-avatar">{firstName?.[0] || 'F'}</span><span>Hi, {firstName || 'farmer'}</span><small>Sign out</small></button> : <button className="account-button" onClick={onAuthClick}><span className="account-icon" aria-hidden="true">◌</span><span>Sign in</span></button>}
          <button className="cart-button" onClick={onCartClick} aria-label={`Open cart with ${cartCount} item${cartCount === 1 ? '' : 's'}`}><span aria-hidden="true">⌑</span><b>Cart</b><em>{cartCount}</em></button>
        </div>
      </div>
    </header>
  );
}
