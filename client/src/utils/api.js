const API_BASE = '/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('admin_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}

export const api = {
  // Products
  getProducts: (params) => request(`/products?${new URLSearchParams(params)}`),
  getProduct: (id) => request(`/products/${id}`),

  // Orders
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),

  // Admin
  login: (password) => request('/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
  getDashboard: () => request('/admin/dashboard'),
  getAdminOrders: (params) => request(`/admin/orders?${new URLSearchParams(params)}`),
  updateOrderStatus: (id, status) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getAdminProducts: () => request('/admin/products'),
  createProduct: (data) => request('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  updateProductStatus: (id, status) => request(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getSettings: () => request('/admin/settings'),
  updateSettings: (data) => request('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
};
