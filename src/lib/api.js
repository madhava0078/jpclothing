const API_BASE = import.meta.env.VITE_API_URL || 'https://jpclothing-api.onrender.com/products';

export function getAuthToken() {
  return localStorage.getItem('jp_auth_token') || '';
}

export function getAdminToken() {
  return localStorage.getItem('jp_admin_token') || '';
}

export function setUserSession(data) {
  localStorage.setItem('jp_auth_token', data.token);
  localStorage.setItem('jp_user', JSON.stringify(data.user));
}

export function clearUserSession() {
  localStorage.removeItem('jp_auth_token');
  localStorage.removeItem('jp_user');
}

export function setAdminSession(data) {
  localStorage.setItem('jp_admin_token', data.token);
  localStorage.setItem('jp_admin_authenticated', 'true');
}

export function clearAdminSession() {
  localStorage.removeItem('jp_admin_token');
  localStorage.removeItem('jp_admin_authenticated');
}

async function request(path, options = {}, token = '') {
  const headers = { ...(options.headers || {}) };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const authToken = token || getAuthToken() || getAdminToken();
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = null;
  try { data = await response.json(); } catch { data = null; }
  if (!response.ok) throw new Error(data?.message || 'Server request failed.');
  return data;
}

export const api = {
  health: () => request('/health'),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  adminLogin: (payload) => request('/auth/admin-login', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: () => request('/orders/me', {}, getAuthToken()),
  getAdminOrders: () => request('/orders', {}, getAdminToken()),
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }, getAuthToken()),
  updateOrderStatus: (id, status) => request(`/orders/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, getAdminToken()),
  markOrdersRead: () => request('/orders/read', { method: 'PATCH' }, getAdminToken()),
  getProducts: () => request('/products'),
  getCustomProducts: () => request('/products/custom'),
  addProduct: (product) => request('/products', { method: 'POST', body: JSON.stringify(product) }, getAdminToken()),
  updateProduct: (id, product) => request(`/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(product) }, getAdminToken()),
  deleteProduct: (id) => request(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' }, getAdminToken())
};
