import { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';
import { filterCatalog } from '../lib/catalog';

export function useCatalog({ category, query }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      setLoading(true);
      setError('');
      try {
        const [productData, categoryData] = await Promise.all([
          api.catalog.getProducts(),
          api.catalog.getCategories(),
        ]);
        if (!active) return;
        setProducts(Array.isArray(productData) ? productData : []);
        setCategories(Array.isArray(categoryData) ? categoryData : []);
      } catch (requestError) {
        if (active) setError(requestError.message || 'The catalog is unavailable right now.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => filterCatalog(products, category, query), [products, category, query]);

  return { products: filteredProducts, categories, loading, error };
}
