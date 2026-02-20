import React, { useState } from 'react';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="product-card">
      <div className="product-image">
        <div className="image-placeholder">
          {product.image.includes('.') ? product.image.split('.')[0] : 'Product'}
        </div>
      </div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="category">{product.category}</p>
        <p className="price">₹{product.price.toLocaleString('en-IN')}</p>
        <p className={`description ${showDetails ? 'expanded' : 'collapsed'}`}>
          {product.description}
        </p>
        <button 
          className="details-btn"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'View Details'}
        </button>
        <button className="add-to-cart-btn">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
