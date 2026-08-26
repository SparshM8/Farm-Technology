import ProductCard from './ProductCard';
import './Products.css';

const labelFor = (value) => value === 'all' ? 'All supplies' : value.replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

export default function Products({ products, categories, selectedCategory, onCategoryChange, searchQuery, onSearchChange, loading, error, onAddToCart }) {
  const categoryOptions = ['all', ...categories.filter(Boolean)];
  return (
    <section id="products" className="catalog-section">
      <div className="catalog-section__topography" aria-hidden="true" />
      <div className="container">
        <div className="catalog-heading">
          <div className="section-heading"><p className="eyebrow">THE FIELD STORE / 01</p><h2>Stock the work<br />that moves you.</h2><p>Search the essentials, narrow the category, and build a basket that stays with you whether you check out as a guest or sign in.</p></div>
          <div className="catalog-summary"><span>Showing</span><strong>{loading ? '…' : products.length}</strong><small>items ready to explore</small></div>
        </div>
        <div className="catalog-toolbar">
          <label className="catalog-search"><span aria-hidden="true">⌕</span><input value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search seeds, soil kits, tools…" aria-label="Search farm products" /><kbd>search</kbd></label>
          <div className="category-chips" aria-label="Product categories">{categoryOptions.map((category) => <button key={category} className={selectedCategory === category ? 'is-active' : ''} onClick={() => onCategoryChange(category)}>{labelFor(category)}</button>)}</div>
        </div>
        {error ? <div className="catalog-state catalog-state--error" role="alert"><strong>Catalog connection unavailable.</strong><span>{error}</span></div> : loading ? <div className="catalog-grid" aria-live="polite">{Array.from({ length: 6 }, (_, index) => <div key={index} className="product-skeleton" />)}</div> : products.length ? <div className="catalog-grid">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAddToCart={onAddToCart} />)}</div> : <div className="catalog-state"><strong>No supplies found for that search.</strong><span>Try a broader term or choose another category.</span><button onClick={() => { onSearchChange(''); onCategoryChange('all'); }}>Clear filters</button></div>}
      </div>
    </section>
  );
}
