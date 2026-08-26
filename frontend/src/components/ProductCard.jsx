import React, { useState } from 'react';
import './ProductCard.css';

export default function ProductCard({ product, onAddToCart }) {
  const [showDetails, setShowDetails] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const add = async () => {
    setAdding(true);
    try {
      await onAddToCart(product);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1800);
    } finally {
      setAdding(false);
    }
  };
  return <article className="product-card"><div className="product-image"><div className="image-placeholder">{product.image?.includes('.') ? product.image.split('.')[0] : 'Farm'}</div></div><div className="product-info"><h3>{product.name}</h3><p className="category">{product.category}</p><p className="price">₹{Number(product.price).toLocaleString('en-IN')}</p><p className={`description ${showDetails ? 'expanded' : 'collapsed'}`}>{product.description}</p><button className="details-btn" onClick={() => setShowDetails(!showDetails)}>{showDetails ? 'Hide details' : 'View details'}</button><button className="add-to-cart-btn" disabled={adding || product.stock < 1} onClick={add}>{adding ? 'Adding…' : added ? 'Added to cart' : product.stock < 1 ? 'Out of stock' : 'Add to cart'}</button></div></article>;
}
