import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

export default function CartDrawer({ open, onClose, onAuthenticate }) {
  const { items, total, itemCount, loading, error, isServerCart, updateQuantity, removeItem } = useCart();

  useEffect(() => {
    if (!open) return undefined;
    const closeOnEscape = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open, onClose]);

  return <div className={`cart-drawer__overlay ${open ? 'open' : ''}`} aria-hidden={!open} onMouseDown={onClose}>
    <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><p className="eyebrow">FIELD BASKET / {isServerCart ? 'SYNCED' : 'GUEST'}</p><h2>Your basket <span>{itemCount}</span></h2></div><button onClick={onClose} aria-label="Close cart">×</button></header>
      {!isServerCart && <div className="cart-drawer__sync"><div><span>⌁</span><strong>Keep this list for later</strong></div><p>Sign in once and your selected farm supplies will sync across your devices.</p><button onClick={onAuthenticate}>Sign in & sync <b>→</b></button></div>}
      {error && <p className="cart-drawer__error" role="alert">{error}</p>}
      <div className="cart-drawer__items">
        {loading ? <p className="cart-drawer__empty">Updating your field basket…</p> : items.length === 0 ? <div className="cart-drawer__empty"><span>⌁</span><strong>Start with one good thing.</strong><p>Seeds, soil care, tools, and crop protection can all live here.</p></div> : items.map((item) => <article className="cart-item" key={item.id}><div className="cart-item__disc" aria-hidden="true">{item.name?.[0]}</div><div className="cart-item__details"><span className="cart-item__category">{isServerCart ? 'Account synced' : 'Saved on this device'}</span><h3>{item.name}</h3><strong>{money(item.price)}</strong></div><div className="cart-item__actions"><div className="quantity-control"><button onClick={() => updateQuantity(item, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>+</button></div><button className="cart-item__remove" onClick={() => removeItem(item)}>Remove</button></div></article>)}
      </div>
      <footer><div className="cart-drawer__total"><span>Estimated total</span><strong>{money(total)}</strong></div><button className="cart-drawer__checkout" disabled={items.length === 0}>Checkout is next <span>→</span></button><p>Checkout and order tracking are not active yet. Your basket remains available while you browse.</p></footer>
    </aside>
  </div>;
}
