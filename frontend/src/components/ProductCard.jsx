import React, { useState } from 'react';
import './ProductCard.css';

const categoryMarks = { fertilizers: 'N', pesticides: 'P', seeds: 'S', tools: 'T', equipment: 'E' };
const palette = ['leaf', 'clay', 'soil', 'sage', 'sun'];
const money = (value) => `₹${Number(value).toLocaleString('en-IN')}`;

export default function ProductCard({ product, index, onAddToCart }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const inStock = Number(product.stock) > 0;
  const category = product.category || 'supplies';

  async function add() {
    if (!inStock || adding) return;
    setAdding(true);
    try {
      await onAddToCart(product);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  }

  return <article className={`product-card product-card--${palette[index % palette.length]}`}>
    <div className="product-card__visual" aria-hidden="true"><span className="product-card__grid" /><span className="product-card__mark">{categoryMarks[category] || 'F'}</span><small>{String(index + 1).padStart(2, '0')}</small><i /></div>
    <div className="product-card__body"><div className="product-card__meta"><span>{category}</span><span className={inStock ? 'stock stock--ready' : 'stock'}>{inStock ? `${product.stock} in stock` : 'Out of stock'}</span></div><h3>{product.name}</h3><p>{product.description}</p><div className="product-card__footer"><strong>{money(product.price)}</strong><button onClick={add} disabled={!inStock || adding} className={added ? 'is-added' : ''}>{adding ? 'Adding…' : added ? 'Added' : inStock ? 'Add to basket' : 'Unavailable'}<span aria-hidden="true">{added ? '✓' : '→'}</span></button></div></div>
  </article>;
}
