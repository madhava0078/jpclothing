const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAdminToken = () =>
  localStorage.getItem('jp_admin_token') || '';

export const setAdminSession = (data) =>
  localStorage.setItem('jp_admin_token', data.token);

export const clearAdminSession = () =>
  localStorage.removeItem('jp_admin_token');

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {})
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAdminToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  let data = null;

  try {
    data = await res.json();
  } catch {
    // no JSON response
  }

  if (!res.ok) {
    throw new Error(
      data?.message || 'Server request failed.'
    );
  }

  return data;
}

export const api = {
  // =========================
  // ADMIN LOGIN
  // =========================

  login: (payload) =>
    request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // =========================
  // ORDERS
  // =========================

  getOrders: () =>
    request('/orders'),

  updateStatus: (id, status) =>
    request(
      `/orders/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status })
      }
    ),

  deleteOrder: (id) =>
    request(
      `/orders/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      }
    ),

  markRead: () =>
    request('/orders/read', {
      method: 'PATCH'
    }),

  // =========================
  // PRODUCTS
  // =========================

  // Get ALL products
  getProducts: () =>
    request('/products'),

  // Add product
  addProduct: (product) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),

  // Update product
  updateProduct: (id, product) =>
    request(
      `/products/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(product)
      }
    ),

  // Delete product
  deleteProduct: (id, type) =>
    request(
      `/products/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        body: JSON.stringify({ type })
      }
    )
};