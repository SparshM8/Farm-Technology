import React, { useState } from 'react';
import './Header.css';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <div className="logo">
            <h1>🌾 Farming Tech Shop</h1>
          </div>
          <button 
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <a href="#home">Home</a>
            <a href="#products">Products</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
}
