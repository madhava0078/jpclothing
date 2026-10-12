import React, { useEffect, useState } from 'react';
import AdminDashboard from './AdminDashboard';

import {
  api,
  getAdminToken,
  setAdminSession,
  clearAdminSession
} from './api';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(getAdminToken())
  );

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [error, setError] = useState('');
  const [username, setUsername] = useState('jpadmin');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // ==========================================
  // LOAD ORDERS + PRODUCTS
  // ==========================================

  const load = async () => {
    try {
      const [orderData, productData] = await Promise.all([
        api.getOrders(),
        api.getProducts()
      ]);

      setOrders(Array.isArray(orderData) ? orderData : []);
      setProducts(Array.isArray(productData) ? productData : []);

      setError('');
    } catch (e) {
      console.error('Dashboard loading error:', e);

      // Avoid logging out for temporary network errors.
      setError(e.message || 'Unable to load dashboard data.');
    }
  };

  // ==========================================
  // LOAD WHEN ADMIN LOGGED IN
  // ==========================================

  useEffect(() => {
    if (!loggedIn) return;

    load();

    const timer = setInterval(() => {
      load();
    }, 10000);

    return () => clearInterval(timer);
  }, [loggedIn]);

  // ==========================================
  // LOGIN
  // ==========================================

  const login = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const data = await api.login({
        username: username.trim(),
        password
      });

      if (!data?.token) {
        throw new Error('Login response did not contain a token.');
      }

      setAdminSession(data);
      setLoggedIn(true);
      setPassword('');
    } catch (e) {
      setError(e.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  const updateStatus = async (id, status) => {
    try {
      const updated = await api.updateStatus(id, status);

      setOrders((prev) =>
        prev.map((order) =>
          String(order.id || order._id) === String(id)
            ? { ...order, ...updated }
            : order
        )
      );

      await load();
    } catch (e) {
      alert(e.message || 'Unable to update order status.');
    }
  };

  // ==========================================
  // DELETE ORDER
  // ==========================================

  const deleteOrder = async (id) => {
    const order = orders.find(
      (item) => String(item.id || item._id) === String(id)
    );

    if (!order) {
      alert('Order not found.');
      return;
    }

    const confirmed = window.confirm(
      `Delete order "${id}" permanently?\n\n` +
      `Customer: ${order.customer?.name || 'Unknown'}\n\n` +
      'This action cannot be undone.'
    );

    if (!confirmed) return;

    try {
      await api.deleteOrder(id);

      setOrders((prev) =>
        prev.filter(
          (item) =>
            String(item.id || item._id) !== String(id)
        )
      );

      alert(`Order ${id} deleted successfully.`);
    } catch (e) {
      alert(e.message || 'Unable to delete order.');
    }
  };

  // ==========================================
  // MARK ORDERS READ
  // ==========================================

  const markRead = async () => {
    try {
      await api.markRead();

      setOrders((prev) =>
        prev.map((order) => ({
          ...order,
          isRead: true
        }))
      );
    } catch (e) {
      alert(e.message || 'Unable to mark orders as read.');
    }
  };

  // ==========================================
  // ADD PRODUCT
  // ==========================================

  const addProduct = async (product) => {
    try {
      const created = await api.addProduct(product);

      setProducts((prev) => [
        created,
        ...prev.filter(
          (item) =>
            String(item._id || item.id) !==
            String(created._id || created.id)
        )
      ]);

      alert('Product added successfully!');
    } catch (e) {
      alert(e.message || 'Unable to add product.');
      throw e;
    }
  };

  // ==========================================
  // UPDATE PRODUCT DETAILS
  // ==========================================

  const updateProduct = async (id, product) => {
    try {
      const updated = await api.updateProduct(id, product);

      setProducts((prev) =>
        prev.map((item) =>
          String(item._id || item.id) === String(id)
            ? { ...item, ...updated }
            : item
        )
      );

      alert('Product updated successfully!');
    } catch (e) {
      alert(e.message || 'Unable to update product.');
      throw e;
    }
  };

  // ==========================================
  // UPDATE PRODUCT STOCK
  // ==========================================

  const updateProductStock = async (
    id,
    stock,
    source = 'custom'
  ) => {
    const numericStock = Number(stock);

    if (
      !Number.isInteger(numericStock) ||
      numericStock < 0
    ) {
      alert('Stock must be a non-negative whole number.');
      throw new Error('Invalid stock quantity.');
    }

    try {
      const updated = await api.updateProductStock(
        id,
        numericStock,
        source
      );

      setProducts((prev) =>
        prev.map((product) => {
          const productId =
            product._id ??
            product.id ??
            product.legacyId;

          return String(productId) === String(id)
            ? {
                ...product,
                ...updated,
                stock: updated?.stock ?? numericStock
              }
            : product;
        })
      );

      // Refresh the dashboard with the server's latest data.
      await load();

      alert('Product stock updated successfully!');
    } catch (e) {
      alert(e.message || 'Unable to update product stock.');
      throw e;
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (id, type) => {
    try {
      await api.deleteProduct(id, type);

      setProducts((prev) =>
        prev.filter((product) => {
          const productId =
            product._id ??
            product.id ??
            product.legacyId;

          return String(productId) !== String(id);
        })
      );

      alert('Product deleted successfully!');
    } catch (e) {
      alert(e.message || 'Unable to delete product.');
      throw e;
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const logout = () => {
    clearAdminSession();

    setLoggedIn(false);
    setOrders([]);
    setProducts([]);
    setError('');
    setPassword('');
  };

  // ==========================================
  // LOGIN SCREEN
  // ==========================================

  if (!loggedIn) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 20,
          boxSizing: 'border-box'
        }}
      >
        <form
          onSubmit={login}
          style={{
            width: '100%',
            maxWidth: 430,
            background: 'var(--card)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-lg)',
            padding: 30,
            boxShadow: 'var(--shadow-lg)',
            boxSizing: 'border-box'
          }}
        >
          <div
            style={{
              color: 'var(--brand)',
              fontWeight: 900,
              fontSize: '.8rem',
              letterSpacing: '.08em'
            }}
          >
            JP CLOTHING
          </div>

          <h1 style={{ margin: '8px 0 4px' }}>
            Admin Panel
          </h1>

          <p
            style={{
              color: 'var(--mute)',
              marginBottom: 20
            }}
          >
            Private seller dashboard — separate
            from the customer website.
          </p>

          <label
            htmlFor="admin-username"
            style={labelStyle}
          >
            Admin username
          </label>

          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Admin username"
            autoComplete="username"
            required
            style={inputStyle}
          />

          <label
            htmlFor="admin-password"
            style={{
              ...labelStyle,
              marginTop: 14
            }}
          >
            Admin password
          </label>

          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            autoComplete="current-password"
            required
            style={{
              ...inputStyle,
              marginTop: 6
            }}
          />

          {error && (
            <div
              role="alert"
              style={{
                color: '#f87171',
                fontWeight: 700,
                fontSize: '.85rem',
                marginTop: 12
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: 18,
              padding: 12,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading
              ? 'Signing in…'
              : 'Sign in to Admin Panel'}
          </button>
        </form>
      </div>
    );
  }

  // ==========================================
  // ADMIN DASHBOARD
  // ==========================================

  return (
    <AdminDashboard
      orders={orders}
      products={products}
      error={error}

      onRefresh={load}

      onUpdateOrderStatus={updateStatus}
      onDeleteOrder={deleteOrder}
      onMarkOrdersRead={markRead}

      onLogout={logout}

      onAddProduct={addProduct}
      onUpdateProduct={updateProduct}
      onUpdateProductStock={updateProductStock}
      onDeleteProduct={deleteProduct}
    />
  );
}

// ==========================================
// SHARED STYLES
// ==========================================

const labelStyle = {
  display: 'block',
  fontSize: '.85rem',
  fontWeight: 700,
  marginBottom: 6
};

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 8,
  border: '1px solid var(--line)',
  background: 'var(--bg)',
  color: 'var(--ink)',
  boxSizing: 'border-box'
};
