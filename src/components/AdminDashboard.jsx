import React, { useState, useRef } from 'react';
import {
    Bell,
    ShoppingBag,
    TrendingUp,
    Clock,
    Search,
    LogOut,
    Plus,
    Trash2,
    Image,
    Package,
    Edit3,
    X,
    Upload,
    CheckCircle2,
    Tag
} from 'lucide-react';

export default function AdminDashboard({
    orders,
    products,
    onUpdateOrderStatus,
    onMarkOrdersRead,
    onLogout,
    onAddProduct,
    onDeleteProduct
}) {
    const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'addProduct'
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    // New Product Form State
    const [newProduct, setNewProduct] = useState({
        n: '',
        c: 'Boys',
        a: '2–8 yrs',
        p: '',
        o: '',
        t: 'New',
        fabric: '',
        description: '',
        sizes: '2-3Y, 4-5Y, 6-7Y',
        colors: '',
        image: ''
    });
    const [imagePreview, setImagePreview] = useState('');
    const [addSuccess, setAddSuccess] = useState(false);
    const fileInputRef = useRef(null);

    const unreadCount = orders.filter(o => !o.isRead).length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.totals?.grandTotal || 0), 0);
    const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;

    const filteredOrders = orders.filter(o => {
        const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
        const matchesSearch = searchTerm === '' ||
            o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.customer.phone.includes(searchTerm) ||
            o.customer.city.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered': return { bg: '#14532d', color: '#86efac' };
            case 'Shipped': return { bg: '#1e3a8a', color: '#93c5fd' };
            case 'Processing': return { bg: '#78350f', color: '#fde047' };
            case 'Cancelled': return { bg: '#7f1d1d', color: '#fca5a5' };
            default: return { bg: '#431407', color: '#fdba74' }; // Pending
        }
    };

    // Handle image upload via file input
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            setImagePreview(base64);
            setNewProduct(prev => ({ ...prev, image: base64 }));
        };
        reader.readAsDataURL(file);
    };

    // Handle form submission for new product
    const handleAddNewProduct = (e) => {
        e.preventDefault();
        if (!newProduct.n.trim() || !newProduct.p) return;

        const sizesArray = newProduct.sizes.split(',').map(s => s.trim()).filter(Boolean);
        const colorsArray = newProduct.colors
            ? newProduct.colors.split(',').map(c => {
                const name = c.trim();
                return { name, hex: '#cccccc' };
            })
            : [{ name: 'Default', hex: '#cccccc' }];

        const productToAdd = {
            id: Date.now(),
            n: newProduct.n.trim(),
            c: newProduct.c,
            a: newProduct.a,
            p: parseInt(newProduct.p),
            o: newProduct.o ? parseInt(newProduct.o) : null,
            k: 'dress',
            bg: '#fbd5df',
            fg: '#c2410c',
            t: newProduct.t || 'New',
            image: newProduct.image || '',
            rating: 5.0,
            reviewsCount: 0,
            fabric: newProduct.fabric || 'Premium Quality',
            sizes: sizesArray.length > 0 ? sizesArray : ['Free Size'],
            colors: colorsArray,
            description: newProduct.description || `${newProduct.n} - Premium quality product from JP Clothing.`,
            washCare: 'Machine wash cold with like colors.',
            isCustom: true
        };

        onAddProduct(productToAdd);

        // Reset form
        setNewProduct({
            n: '',
            c: 'Boys',
            a: '2–8 yrs',
            p: '',
            o: '',
            t: 'New',
            fabric: '',
            description: '',
            sizes: '2-3Y, 4-5Y, 6-7Y',
            colors: '',
            image: ''
        });
        setImagePreview('');
        setAddSuccess(true);
        setTimeout(() => setAddSuccess(false), 3000);
    };

    const tabBtnStyle = (isActive) => ({
        padding: '8px 18px',
        borderRadius: '999px',
        border: isActive ? '2px solid var(--brand)' : '1px solid var(--line)',
        background: isActive ? 'var(--brand)' : 'var(--card)',
        color: isActive ? 'var(--brand-ink)' : 'var(--ink)',
        fontWeight: 800,
        fontSize: '0.85rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'all 0.2s ease'
    });

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: '8px',
        border: '1px solid var(--line)',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontSize: '0.9rem',
        fontWeight: 600
    };

    const labelStyle = {
        fontWeight: 800,
        fontSize: '0.82rem',
        display: 'block',
        marginBottom: '4px',
        color: 'var(--ink)'
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'var(--bg)',
            color: 'var(--ink)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto'
        }}>

            {/* Admin Top Navbar */}
            <div style={{
                background: 'var(--card)',
                borderBottom: '1px solid var(--line)',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        border: '1px solid var(--brand)'
                    }}>
                        <img src="/images/jp_logo.jpeg" alt="JP Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <div style={{
                            fontFamily: 'Cinzel, serif',
                            fontWeight: 800,
                            fontSize: '1.15rem',
                            lineHeight: 1
                        }} className="brand-text">
                            JP CLOTHING ADMIN
                        </div>
                        <span style={{ color: 'var(--mute)', fontSize: '0.74rem', fontStyle: 'italic' }}>
                            Styles that defines you ..
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

                    {/* Notification Bell with Badge */}
                    <button
                        onClick={onMarkOrdersRead}
                        style={{
                            position: 'relative',
                            background: 'var(--bg)',
                            border: '1px solid var(--line)',
                            borderRadius: '50%',
                            width: '42px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        title={unreadCount > 0 ? `${unreadCount} new order notifications!` : 'No new notifications'}
                    >
                        <Bell size={20} color={unreadCount > 0 ? "var(--brand)" : "var(--ink)"} />
                        {unreadCount > 0 && (
                            <span className="animate-pulse" style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                background: 'var(--accent)',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.74rem',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 8px rgba(244, 63, 94, 0.4)'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Logout Button */}
                    <button
                        onClick={onLogout}
                        style={{
                            background: 'transparent',
                            color: 'var(--brand)',
                            border: '1px solid var(--brand)',
                            borderRadius: '999px',
                            padding: '6px 16px',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <LogOut size={16} /> Exit Admin
                    </button>
                </div>
            </div>

            {/* Main Admin Content Container */}
            <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '24px 16px 48px' }}>

                {/* TAB NAVIGATION */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <button onClick={() => setActiveTab('orders')} style={tabBtnStyle(activeTab === 'orders')}>
                        <ShoppingBag size={16} /> Orders {orders.length > 0 && `(${orders.length})`}
                    </button>
                    <button onClick={() => setActiveTab('products')} style={tabBtnStyle(activeTab === 'products')}>
                        <Package size={16} /> My Products {products.length > 0 && `(${products.length})`}
                    </button>
                    <button onClick={() => setActiveTab('addProduct')} style={tabBtnStyle(activeTab === 'addProduct')}>
                        <Plus size={16} /> Add New Product
                    </button>
                </div>

                {/* Notification Toast Alert Banner if unread orders */}
                {unreadCount > 0 && activeTab === 'orders' && (
                    <div style={{
                        background: 'linear-gradient(90deg, #380811 0%, #701020 50%, #380811 100%)',
                        border: '1px solid var(--brand)',
                        color: '#ffffff',
                        borderRadius: 'var(--radius-md)',
                        padding: '14px 20px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: 'var(--gold-glow)'
                    }}
                        className="animate-fade-in"
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Bell size={24} color="var(--brand)" className="animate-float" />
                            <div>
                                <strong style={{ fontSize: '1.05rem', display: 'block', color: 'var(--brand)' }}>
                                    🔔 {unreadCount} New Order Notification{unreadCount > 1 ? 's' : ''}!
                                </strong>
                                <span style={{ fontSize: '0.86rem', opacity: 0.9 }}>
                                    Customers just placed new orders. Review details and dispatch below.
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onMarkOrdersRead}
                            className="btn-primary"
                            style={{
                                padding: '6px 16px',
                                fontSize: '0.84rem'
                            }}
                        >
                            Mark All Read
                        </button>
                    </div>
                )}

                {/* ===================== ORDERS TAB ===================== */}
                {activeTab === 'orders' && (
                    <>
                        {/* Stats Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                            gap: '16px',
                            marginBottom: '28px'
                        }}>
                            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--mute)', fontSize: '0.85rem', fontWeight: 700 }}>
                                    <span>TOTAL REVENUE</span>
                                    <TrendingUp size={18} color="var(--brand)" />
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--brand)', marginTop: '6px', fontFamily: 'Cinzel, serif' }}>
                                    ₹{totalRevenue.toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--brand)', fontWeight: 700, marginTop: '4px' }}>
                                    Store Revenue Performance
                                </div>
                            </div>

                            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--mute)', fontSize: '0.85rem', fontWeight: 700 }}>
                                    <span>TOTAL ORDERS</span>
                                    <ShoppingBag size={18} color="var(--brand)" />
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', marginTop: '6px', fontFamily: 'Cinzel, serif' }}>
                                    {orders.length}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--mute)', marginTop: '4px' }}>
                                    Lifetime customer orders
                                </div>
                            </div>

                            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--mute)', fontSize: '0.85rem', fontWeight: 700 }}>
                                    <span>NEW NOTIFICATIONS</span>
                                    <Bell size={18} color="var(--brand)" />
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: unreadCount > 0 ? 'var(--brand)' : 'var(--ink)', marginTop: '6px', fontFamily: 'Cinzel, serif' }}>
                                    {unreadCount}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--mute)', marginTop: '4px' }}>
                                    Unread order alerts
                                </div>
                            </div>

                            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--mute)', fontSize: '0.85rem', fontWeight: 700 }}>
                                    <span>PENDING DISPATCH</span>
                                    <Clock size={18} color="#f5d061" />
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f5d061', marginTop: '6px', fontFamily: 'Cinzel, serif' }}>
                                    {pendingCount}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--mute)', marginTop: '4px' }}>
                                    Requires packing & shipping
                                </div>
                            </div>
                        </div>

                        {/* Live Orders Management Table Section */}
                        <div style={{
                            background: 'var(--card)',
                            border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-lg)',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)'
                        }}>
                            {/* Table Control Header */}
                            <div style={{
                                padding: '16px 20px',
                                borderBottom: '1px solid var(--line)',
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '12px',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--bg)'
                            }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontFamily: 'Cinzel, serif', color: 'var(--brand)' }}>
                                        Live JP CLOTHING Orders ({filteredOrders.length})
                                    </h2>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--mute)' }}>
                                        Real-time notification list. Click status to update customer dispatch state.
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                    {/* Search */}
                                    <div style={{ position: 'relative', width: '220px' }}>
                                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mute)' }} />
                                        <input
                                            type="text"
                                            placeholder="Search order ID, name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '6px 10px 6px 30px',
                                                borderRadius: '8px',
                                                border: '1px solid var(--line)',
                                                background: 'var(--card)',
                                                color: 'var(--ink)',
                                                fontSize: '0.84rem'
                                            }}
                                        />
                                    </div>

                                    {/* Status Filter buttons */}
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {['All', 'Pending', 'Processing', 'Shipped', 'Delivered'].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => setStatusFilter(st)}
                                                style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '999px',
                                                    border: statusFilter === st ? '1px solid var(--brand)' : '1px solid var(--line)',
                                                    background: statusFilter === st ? 'var(--brand)' : 'var(--card)',
                                                    color: statusFilter === st ? 'var(--brand-ink)' : 'var(--ink)',
                                                    fontWeight: 700,
                                                    fontSize: '0.78rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Orders Table */}
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--line)', color: 'var(--mute)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                            <th style={{ padding: '12px 16px' }}>Order ID</th>
                                            <th style={{ padding: '12px 16px' }}>Date & Time</th>
                                            <th style={{ padding: '12px 16px' }}>Customer Info</th>
                                            <th style={{ padding: '12px 16px' }}>Items Summary</th>
                                            <th style={{ padding: '12px 16px' }}>Total Amount</th>
                                            <th style={{ padding: '12px 16px' }}>Status & Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--mute)' }}>
                                                    No orders match your search or filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map((order) => {
                                                const stColor = getStatusColor(order.status);
                                                return (
                                                    <tr
                                                        key={order.id}
                                                        style={{
                                                            borderBottom: '1px solid var(--line)',
                                                            background: order.isRead ? 'transparent' : 'rgba(212, 175, 55, 0.08)',
                                                            transition: 'background 0.2s ease'
                                                        }}
                                                    >
                                                        <td style={{ padding: '14px 16px', fontWeight: 800, color: 'var(--brand)' }}>
                                                            {order.id}
                                                            {!order.isRead && (
                                                                <span style={{
                                                                    marginLeft: '6px',
                                                                    background: 'var(--accent)',
                                                                    color: '#fff',
                                                                    fontSize: '0.65rem',
                                                                    padding: '1px 6px',
                                                                    borderRadius: '999px',
                                                                    fontWeight: 800
                                                                }}>
                                                                    NEW
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ padding: '14px 16px', color: 'var(--mute)', fontSize: '0.82rem' }}>
                                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td style={{ padding: '14px 16px' }}>
                                                            <div style={{ fontWeight: 800, color: 'var(--ink)' }}>{order.customer.name}</div>
                                                            <div style={{ fontSize: '0.78rem', color: 'var(--brand)' }}>📞 {order.customer.phone}</div>
                                                            <div style={{ fontSize: '0.76rem', color: 'var(--mute)' }}>📍 {order.customer.city}, {order.customer.pincode}</div>
                                                        </td>
                                                        <td style={{ padding: '14px 16px' }}>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                                {order.items.map((it, idx) => (
                                                                    <span key={idx} style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                                                                        • {it.n} ({it.selectedSize}) x{it.quantity || 1}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '14px 16px' }}>
                                                            <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--brand)' }}>
                                                                ₹{order.totals.grandTotal}
                                                            </div>
                                                            <div style={{ fontSize: '0.74rem', color: 'var(--mute)' }}>
                                                                {order.paymentMethod}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '14px 16px' }}>
                                                            <select
                                                                value={order.status}
                                                                onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                                                                style={{
                                                                    background: stColor.bg,
                                                                    color: stColor.color,
                                                                    border: '1px solid var(--line)',
                                                                    borderRadius: '999px',
                                                                    padding: '6px 12px',
                                                                    fontWeight: 800,
                                                                    fontSize: '0.82rem',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <option value="Pending">🕒 Pending</option>
                                                                <option value="Processing">📦 Processing</option>
                                                                <option value="Shipped">🚚 Shipped</option>
                                                                <option value="Delivered">✅ Delivered</option>
                                                                <option value="Cancelled">❌ Cancelled</option>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ===================== PRODUCTS TAB ===================== */}
                {activeTab === 'products' && (
                    <div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.3rem', fontFamily: 'Cinzel, serif', color: 'var(--brand)' }}>
                                    📦 My Product Catalog ({products.length})
                                </h2>
                                <p style={{ color: 'var(--mute)', fontSize: '0.85rem' }}>
                                    Manage all your products. Admin-added products can be deleted.
                                </p>
                            </div>
                            <button onClick={() => setActiveTab('addProduct')} style={tabBtnStyle(false)}>
                                <Plus size={16} /> Add New
                            </button>
                        </div>

                        {/* Products Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '16px'
                        }}>
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    style={{
                                        background: 'var(--card)',
                                        border: '1px solid var(--line)',
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                        boxShadow: 'var(--shadow-sm)',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {/* Product Image */}
                                    <div style={{
                                        height: '180px',
                                        background: product.bg || '#28050b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        {product.image ? (
                                            <img
                                                src={product.image}
                                                alt={product.n}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                                                <Image size={48} color="var(--mute)" style={{ opacity: 0.3 }} />
                                            </div>
                                        )}

                                        {/* Badge indicators */}
                                        <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                                            {product.t && (
                                                <span style={{
                                                    background: product.t === 'Sale' ? 'var(--accent)' : 'var(--brand)',
                                                    color: '#fff',
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '999px'
                                                }}>
                                                    {product.t}
                                                </span>
                                            )}
                                            {product.isCustom && (
                                                <span style={{
                                                    background: '#25d366',
                                                    color: '#fff',
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '999px'
                                                }}>
                                                    ADMIN ADDED
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div style={{ padding: '14px 16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1rem', fontFamily: 'Cinzel, serif', fontWeight: 700, color: 'var(--ink)', marginBottom: '2px' }}>
                                                    {product.n}
                                                </h3>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--mute)' }}>
                                                    {product.c} • {product.a}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand)' }}>₹{product.p}</div>
                                                {product.o && (
                                                    <s style={{ color: 'var(--mute)', fontSize: '0.8rem' }}>₹{product.o}</s>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                                            {product.sizes?.slice(0, 4).map((size, i) => (
                                                <span key={i} style={{
                                                    background: 'var(--bg)',
                                                    border: '1px solid var(--line)',
                                                    padding: '2px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.72rem',
                                                    fontWeight: 700,
                                                    color: 'var(--mute)'
                                                }}>
                                                    {size}
                                                </span>
                                            ))}
                                            {product.sizes?.length > 4 && (
                                                <span style={{ fontSize: '0.72rem', color: 'var(--mute)', fontWeight: 700 }}>
                                                    +{product.sizes.length - 4}
                                                </span>
                                            )}
                                        </div>

                                        {/* Delete button for custom products */}
                                        {product.isCustom && (
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete "${product.n}" permanently?`)) {
                                                        onDeleteProduct(product._id || product.id);
                                                    }
                                                }}
                                                style={{
                                                    marginTop: '12px',
                                                    width: '100%',
                                                    padding: '7px 12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #f43f5e',
                                                    background: 'rgba(244, 63, 94, 0.1)',
                                                    color: '#f43f5e',
                                                    fontWeight: 800,
                                                    fontSize: '0.82rem',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            >
                                                <Trash2 size={14} /> Delete Product
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {products.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--mute)' }}>
                                <Package size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                                <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>No products yet</p>
                                <p style={{ fontSize: '0.9rem' }}>Click "Add New Product" to start building your catalog</p>
                            </div>
                        )}
                    </div>
                )}

                {/* ===================== ADD PRODUCT TAB ===================== */}
                {activeTab === 'addProduct' && (
                    <div style={{
                        maxWidth: '700px',
                        margin: '0 auto'
                    }}>
                        <h2 style={{ fontSize: '1.4rem', fontFamily: 'Cinzel, serif', color: 'var(--brand)', marginBottom: '6px' }}>
                            ➕ Add New Product / Collection
                        </h2>
                        <p style={{ color: 'var(--mute)', fontSize: '0.88rem', marginBottom: '24px' }}>
                            Add your own product with photo, pricing, sizes, and details. It will appear in the store immediately.
                        </p>

                        {addSuccess && (
                            <div className="animate-fade-in" style={{
                                background: 'rgba(34, 197, 94, 0.15)',
                                border: '1px solid #22c55e',
                                color: '#22c55e',
                                padding: '12px 18px',
                                borderRadius: '10px',
                                marginBottom: '20px',
                                fontWeight: 800,
                                fontSize: '0.92rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <CheckCircle2 size={20} /> Product added successfully! It's now live in your store. 🎉
                            </div>
                        )}

                        <form onSubmit={handleAddNewProduct} style={{
                            background: 'var(--card)',
                            border: '1px solid var(--line)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '28px',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '18px'
                        }}>

                            {/* Image Upload Section */}
                            <div>
                                <label style={labelStyle}>📷 Product Photo *</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{
                                        width: '100%',
                                        height: '220px',
                                        borderRadius: '12px',
                                        border: '2px dashed var(--brand)',
                                        background: imagePreview ? 'transparent' : 'var(--bg)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        overflow: 'hidden',
                                        position: 'relative',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '8px',
                                                right: '8px',
                                                background: 'rgba(0,0,0,0.7)',
                                                color: '#fff',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                                fontSize: '0.78rem',
                                                fontWeight: 700,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <Edit3 size={12} /> Change Photo
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={36} color="var(--brand)" style={{ marginBottom: '8px', opacity: 0.6 }} />
                                            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--brand)' }}>
                                                Click to Upload Product Photo
                                            </span>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--mute)', marginTop: '4px' }}>
                                                JPG, PNG, WebP supported (max 5MB)
                                            </span>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {/* Product Name */}
                            <div>
                                <label style={labelStyle}>Product Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Premium Cotton Kurta Set"
                                    value={newProduct.n}
                                    onChange={(e) => setNewProduct(prev => ({ ...prev, n: e.target.value }))}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Category + Age Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                                <div>
                                    <label style={labelStyle}>Category *</label>
                                    <select
                                        value={newProduct.c}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, c: e.target.value }))}
                                        style={inputStyle}
                                    >
                                        <option value="Boys">Boys</option>
                                        <option value="Girls">Girls</option>
                                        <option value="Infants">Infants</option>
                                        <option value="Unisex">Unisex</option>
                                        <option value="Men">Men</option>
                                        <option value="Women">Women</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Age Range *</label>
                                    <select
                                        value={newProduct.a}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, a: e.target.value }))}
                                        style={inputStyle}
                                    >
                                        <option value="0–6 mo">0–6 mo</option>
                                        <option value="0–2 yrs">0–2 yrs</option>
                                        <option value="1–7 yrs">1–7 yrs</option>
                                        <option value="2–8 yrs">2–8 yrs</option>
                                        <option value="2–10 yrs">2–10 yrs</option>
                                        <option value="3–10 yrs">3–10 yrs</option>
                                        <option value="All Ages">All Ages</option>
                                    </select>
                                </div>
                            </div>

                            {/* Price + Original Price + Tag Row */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                                <div>
                                    <label style={labelStyle}>Selling Price (₹) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        placeholder="699"
                                        value={newProduct.p}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, p: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>MRP / Original (₹)</label>
                                    <input
                                        type="number"
                                        placeholder="999"
                                        value={newProduct.o}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, o: e.target.value }))}
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={labelStyle}>Product Tag</label>
                                    <select
                                        value={newProduct.t}
                                        onChange={(e) => setNewProduct(prev => ({ ...prev, t: e.target.value }))}
                                        style={inputStyle}
                                    >
                                        <option value="New">🆕 New</option>
                                        <option value="Sale">🏷️ Sale</option>
                                        <option value="Bestseller">🏆 Bestseller</option>
                                        <option value="Trending">🔥 Trending</option>
                                        <option value="Popular">⭐ Popular</option>
                                        <option value="Essential">💎 Essential</option>
                                        <option value="Limited">⏳ Limited</option>
                                    </select>
                                </div>
                            </div>

                            {/* Fabric */}
                            <div>
                                <label style={labelStyle}>Fabric / Material</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 100% Cotton, Silk Blend"
                                    value={newProduct.fabric}
                                    onChange={(e) => setNewProduct(prev => ({ ...prev, fabric: e.target.value }))}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Sizes */}
                            <div>
                                <label style={labelStyle}>Available Sizes (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 2-3Y, 4-5Y, 6-7Y, 8-9Y"
                                    value={newProduct.sizes}
                                    onChange={(e) => setNewProduct(prev => ({ ...prev, sizes: e.target.value }))}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Colors */}
                            <div>
                                <label style={labelStyle}>Available Colors (comma separated)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Red, Blue, Green, Pink"
                                    value={newProduct.colors}
                                    onChange={(e) => setNewProduct(prev => ({ ...prev, colors: e.target.value }))}
                                    style={inputStyle}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label style={labelStyle}>Product Description</label>
                                <textarea
                                    placeholder="Describe the product features, quality, and style..."
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    style={{ ...inputStyle, resize: 'vertical' }}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize: '1rem',
                                    marginTop: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Plus size={20} /> Add Product to Store
                            </button>

                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}
