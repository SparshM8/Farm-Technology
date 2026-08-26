const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export async function apiRequest(path, { token, headers, body, ...options } = {}) {
  const requestHeaders = { ...(headers || {}) };

  if (body && !(body instanceof FormData) && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: requestHeaders,
    body,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Something went wrong. Please try again.');
  }

  return data;
}

export const api = {
  catalog: {
    getProducts: () => apiRequest('/api/products'),
    getCategories: () => apiRequest('/api/products/categories/all'),
  },
  auth: {
    login: (email, password) => apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    register: (email, name, password, phone) => apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, name, password, phone }),
    }),
  },
  cart: {
    get: (token) => apiRequest('/api/cart', { token }),
    add: (token, productId, quantity) => apiRequest('/api/cart/items', {
      method: 'POST',
      token,
      body: JSON.stringify({ productId, quantity }),
    }),
    update: (token, itemId, quantity) => apiRequest(`/api/cart/items/${itemId}`, {
      method: 'PUT',
      token,
      body: JSON.stringify({ quantity }),
    }),
    remove: (token, itemId) => apiRequest(`/api/cart/items/${itemId}`, {
      method: 'DELETE',
      token,
    }),
  },
  contact: (payload) => apiRequest('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};
