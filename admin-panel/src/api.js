const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://jpclothing-api.onrender.com/api';

// =========================
// ADMIN SESSION
// =========================

export const getAdminToken = () =>
  localStorage.getItem('jp_admin_token') || '';

export const setAdminSession = (data) => {
  if (data?.token) {
    localStorage.setItem('jp_admin_token', data.token);
  }
};

export const clearAdminSession = () =>
  localStorage.removeItem('jp_admin_token');

// =========================
// API REQUEST HELPER
// =========================

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
    // Response may not contain JSON.
  }

  if (!res.ok) {
    throw new Error(
      data?.message || `Server request failed (${res.status}).`
    );
  }

  return data;
}

// =========================
// ADMIN API
// =========================

export const api = {
  // -------------------------
  // ADMIN LOGIN
  // -------------------------

  login: (payload) =>
    request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // -------------------------
  // ORDERS
  // -------------------------

  getOrders: () =>
    request('/orders'),

  updateStatus: (id, status) =>
    request(`/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  deleteOrder: (id) =>
    request(`/orders/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    }),

  markRead: () =>
    request('/orders/mark-read', {
      method: 'PATCH'
    }),

  // -------------------------
  // PRODUCTS
  // -------------------------

  getProducts: () =>
    request('/products'),

  addProduct: (product) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),

  updateProduct: (id, product) =>
    request(`/products/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(product)
    }),

  // -------------------------
  // UPDATE PRODUCT STOCK
  // -------------------------

  updateProductStock: (id, stock, source = 'custom') => {
    const numericStock = Number(stock);

    if (
      stock === '' ||
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      throw new Error(
        'Stock must be a non-negative whole number.'
      );
    }

    return request(
      `/products/${encodeURIComponent(id)}/stock`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          stock: numericStock,
          source
        })
      }
    );
  },

  // -------------------------
  // DELETE PRODUCT
  // -------------------------

  deleteProduct: (id, type) =>
    request(`/products/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      body: JSON.stringify({ type })
    })
};
