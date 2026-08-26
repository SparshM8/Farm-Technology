function safeStock(stock) {
  const parsed = Number(stock);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

export function addGuestCartItem(items, product) {
  const existing = items.find((item) => item.productId === product.id);
  if (!existing) {
    return [...items, { id: product.id, productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }];
  }

  return items.map((item) => item.productId === product.id
    ? { ...item, quantity: Math.min(item.quantity + 1, safeStock(product.stock)) }
    : item);
}

export function setGuestItemQuantity(items, productId, quantity) {
  return items.map((item) => item.productId === productId
    ? { ...item, quantity: Math.min(quantity, safeStock(item.stock)) }
    : item);
}
