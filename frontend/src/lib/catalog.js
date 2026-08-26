export function filterCatalog(products, category, query) {
  const normalizedQuery = query.trim().toLowerCase();
  return products.filter((product) => {
    const inCategory = category === 'all' || product.category === category;
    const searchable = `${product.name} ${product.description} ${product.category}`.toLowerCase();
    return inCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
  });
}
