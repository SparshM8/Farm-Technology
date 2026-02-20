import React from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section id="home" className="hero">
      <div className="hero-content">
        <h2>Welcome to Farming Tech Shop</h2>
        <p>Premium agricultural products for modern farming</p>
        <a href="#products" className="cta-button">
          Explore Products
        </a>
      </div>
    </section>
  );
}
