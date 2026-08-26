import React from 'react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

export default function CartDrawer({ open, onClose, onAuthenticate }) {
  const { items, total, itemCount, loading, error, isServerCart, updateQuantity, removeItem } = useCart();
  return <div className={`cart-drawer__overlay ${open ? 'open' : ''}`} aria-hidden={!open} onMouseDown={onClose}>
    <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Shopping cart" onMouseDown={(event) => event.stopPropagation()}>
      <header><div><p className="eyebrow">YOUR FARM ORDER</p><h2>Cart <span>{itemCount}</span></h2></div><button onClick={onClose} aria-label="Close cart">×</button></header>
      {!isServerCart && <div className="cart-drawer__sync"><strong>Guest cart</strong><p>Your items are saved in this browser. Sign in to sync them to your farm account.</p><button onClick={onAuthenticate}>Sign in & sync</button></div>}
      {error && <p className="cart-drawer__error" role="alert">{error}</p>}
      <div className="cart-drawer__items">
        {loading ? <p className="cart-drawer__empty">Updating your cart…</p> : items.length === 0 ? <p className="cart-drawer__empty">Your cart is ready for seeds, tools, and smarter farm essentials.</p> : items.map((item) => <article className="cart-item" key={item.id}><div><span className="cart-item__category">{isServerCart ? 'Synced item' : 'Saved locally'}</span><h3>{item.name}</h3><strong>{money(item.price)}</strong></div><div className="cart-item__actions"><div><button onClick={() => updateQuantity(item, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`}>−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`}>+</button></div><button className="cart-item__remove" onClick={() => removeItem(item)}>Remove</button></div></article>)}
      </div>
      <footer><div className="cart-drawer__total"><span>Estimated total</span><strong>{money(total)}</strong></div><button className="cart-drawer__checkout" disabled={items.length === 0}>Checkout coming next</button><p>Secure checkout and order tracking are the next store milestone.</p></footer>
    </aside>
  </div>;
}
