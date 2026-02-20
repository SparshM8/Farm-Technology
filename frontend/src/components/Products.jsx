import React, { useState } from 'react';
import ProductCard from './ProductCard';
import './Products.css';

export default function Products({ products, categories, selectedCategory, onCategoryChange, loading }) {
  return (
    <section id="products" className="products-section">
      <div className="container">
        <h2>Our Products</h2>
        
        <div className="category-filters">
          <button
            className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryChange('all')}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <p className="no-products">No products found in this category.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
