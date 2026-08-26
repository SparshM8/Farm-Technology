import React from 'react';
import './Hero.css';

export default function Hero({ onBrowseCatalog, onOpenCart }) {
  return (
    <section id="home" className="hero">
      <div className="hero__texture" aria-hidden="true" />
      <div className="hero__content container">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow"><span /> FIELD-READY AGRI COMMERCE</p>
          <h1>Grow the next <em>good</em> season.</h1>
          <p className="hero__lede">A focused supply desk for seeds, soil care, crop protection, tools, and the small essentials that keep field work moving.</p>
          <div className="hero__actions"><button className="hero__primary" onClick={onBrowseCatalog}>Browse the field store <span>→</span></button><button className="hero__secondary" onClick={onOpenCart}>Open basket <span>⌑</span></button></div>
          <div className="hero__proof" aria-label="Store highlights"><span><b>Catalog</b><small>Live product search</small></span><i /><span><b>Cart</b><small>Guest or account synced</small></span><i /><span><b>Support</b><small>Direct farm questions</small></span></div>
        </div>
        <div className="hero__art" aria-label="Abstract field map visual">
          <div className="field-map"><span className="field-map__sun">01</span><span className="field-map__line field-map__line--one" /><span className="field-map__line field-map__line--two" /><span className="field-map__crop field-map__crop--one" /><span className="field-map__crop field-map__crop--two" /><span className="field-map__label">SOIL / SEED / SYSTEM</span></div>
          <div className="hero__note"><span>Now organising</span><strong>Your growing list.</strong><i>⌁</i></div>
        </div>
      </div>
    </section>
  );
}
