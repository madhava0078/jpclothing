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
      const [orderData, productData] =
        await Promise.all([
          api.getOrders(),
          api.getProducts()
        ]);

      setOrders(orderData || []);
      setProducts(productData || []);

      setError('');
    } catch (e) {
      console.error(e);

      clearAdminSession();

      setLoggedIn(false);

      setOrders([]);
      setProducts([]);

      setError(e.message);
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
        username,
        password
      });

      setAdminSession(data);

      setLoggedIn(true);

      setPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE ORDER STATUS
  // ==========================================

  const updateStatus = async (id, status) => {
    try {
      const updated = await api.updateStatus(
        id,
        status
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? updated : o
        )
      );
    } catch (e) {
      alert(e.message);
    }
  };

  // ==========================================
  // DELETE ORDER
  // ==========================================

  const deleteOrder = async (id) => {
    const order = orders.find((o) => o.id === id);

    if (!order) {
      alert('Order not found.');
      return;
    }

    const confirmed = window.confirm(
      `Delete order "${order.id}" permanently?\n\nCustomer: ${order.customer?.name || 'Unknown'}\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await api.deleteOrder(id);

      setOrders((prev) =>
        prev.filter((o) => o.id !== id)
      );

      alert(`Order ${id} deleted successfully.`);
    } catch (e) {
      alert(e.message);
    }
  };

  // ==========================================
  // MARK ORDERS READ
  // ==========================================

  const markRead = async () => {
    try {
      await api.markRead();

      setOrders((prev) =>
        prev.map((o) => ({
          ...o,
          isRead: true
        }))
      );
    } catch (e) {
      alert(e.message);
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
        ...prev
      ]);

      alert('Product added successfully!');
    } catch (e) {
      alert(e.message);
    }
  };

  // ==========================================
  // UPDATE PRODUCT
  // ==========================================

  const updateProduct = async (
    id,
    product
  ) => {
    try {
      const updated =
        await api.updateProduct(
          id,
          product
        );

      setProducts((prev) =>
        prev.map((p) =>
          (p._id || p.id) === id
            ? updated
            : p
        )
      );

      alert('Product updated successfully!');
    } catch (e) {
      alert(e.message);
    }
  };

  // ==========================================
  // DELETE PRODUCT
  // ==========================================

  const deleteProduct = async (id, type) => {
    try {
      await api.deleteProduct(id, type);

      setProducts((prev) =>
        prev.filter(
          (p) =>
            (p._id || p.id) !== id
        )
      );

      alert('Product deleted successfully!');
    } catch (e) {
      alert(e.message);
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
          padding: 20
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
            boxShadow: 'var(--shadow-lg)'
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

          <h1
            style={{
              margin: '8px 0 4px'
            }}
          >
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

          <input
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            placeholder="Admin username"
            style={inputStyle}
          />

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Admin password"
            style={{
              ...inputStyle,
              marginTop: 12
            }}
            required
          />

          {error && (
            <div
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
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: 16,
              padding: 12
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

      onUpdateOrderStatus={
        updateStatus
      }

      onDeleteOrder={
        deleteOrder
      }

      onMarkOrdersRead={
        markRead
      }

      onLogout={
        logout
      }

      onAddProduct={
        addProduct
      }

      onUpdateProduct={
        updateProduct
      }

      onDeleteProduct={
        deleteProduct
      }
    />
  );
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 8,
  border: '1px solid var(--line)',
  background: 'var(--bg)',
  color: 'var(--ink)'
};