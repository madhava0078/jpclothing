import React, { useRef, useState } from 'react';
import {
    Bell,
    ShoppingBag,
    Search,
    LogOut,
    Plus,
    Trash2,
    Image as ImageIcon,
    Package,
    Upload,
    CheckCircle2
} from 'lucide-react';

export default function AdminDashboard({
    orders,
    products,
    onUpdateOrderStatus,
    onDeleteOrder,
    onMarkOrdersRead,
    onLogout,
    onAddProduct,
    onDeleteProduct
}) {
    const [activeTab, setActiveTab] = useState('orders');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

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
        image: '',
        stock: 0
    });

    const [imagePreview, setImagePreview] = useState('');
    const [addSuccess, setAddSuccess] = useState(false);

    const fileInputRef = useRef(null);

    /* =====================================================
       PRODUCTS
       ===================================================== */

    const allProducts = (products || []).map(product => ({
        ...product,
        isBuiltIn: product.source === 'builtin',
        isCustom: product.source !== 'builtin'
    }));

    /*
     * Remove duplicate IDs
     */
    const uniqueProducts = Array.from(
        new Map(
            allProducts.map(product => [
                String(product._id || product.id),
                product
            ])
        ).values()
    );

    /* =====================================================
       ORDERS
       ===================================================== */

    const unreadCount = (orders || []).filter(
        order => !order.isRead
    ).length;

    const totalRevenue = (orders || []).reduce(
        (total, order) =>
            total + Number(order.totals?.grandTotal || 0),
        0
    );

    const pendingCount = (orders || []).filter(
        order =>
            order.status === 'Pending' ||
            order.status === 'Processing'
    ).length;

    const filteredOrders = (orders || []).filter(order => {
        const matchesStatus =
            statusFilter === 'All' ||
            order.status === statusFilter;

        const search = searchTerm.toLowerCase();

        const matchesSearch =
            !search ||
            order.id?.toLowerCase().includes(search) ||
            order.customer?.name
                ?.toLowerCase()
                .includes(search) ||
            order.customer?.phone
                ?.toLowerCase()
                .includes(search) ||
            order.customer?.city
                ?.toLowerCase()
                .includes(search);

        return matchesStatus && matchesSearch;
    });

    const printInvoice = (order) => {
        const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
        const rows = (order.items || []).map(item => `<tr><td>${String(item.n || 'Product').replace(/[<>]/g,'')}</td><td>${item.quantity || 1}</td><td>${money(item.p)}</td><td>${money((item.p || 0) * (item.quantity || 1))}</td></tr>`).join('');
        const win = window.open('', '_blank', 'width=800,height=900');
        if (!win) { alert('Allow pop-ups to print the invoice.'); return; }
        win.document.write(`<!doctype html><html><head><title>Invoice ${order.invoiceNumber || order.id}</title><style>body{font:14px Arial;padding:32px;color:#222}h1{margin-bottom:4px}table{width:100%;border-collapse:collapse;margin-top:24px}th,td{border:1px solid #ddd;padding:10px;text-align:left}th{background:#f6f0e0}.total{text-align:right;font-size:18px;font-weight:bold;margin-top:24px}.muted{color:#666}</style></head><body><h1>JP Clothing</h1><div class="muted">Styles that defines you</div><h2>Invoice</h2><p><b>Invoice No:</b> ${order.invoiceNumber || 'Pending approval'}<br><b>Order ID:</b> ${order.id}<br><b>Date:</b> ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}</p><p><b>Customer:</b> ${String(order.customer?.name || '').replace(/[<>]/g,'')}<br><b>Phone:</b> ${String(order.customer?.phone || '').replace(/[<>]/g,'')}<br><b>Address:</b> ${String([order.customer?.address,order.customer?.city,order.customer?.pincode].filter(Boolean).join(', ')).replace(/[<>]/g,'')}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="total">Subtotal: ${money(order.totals?.subtotal)}<br>Delivery: ${money(order.totals?.shipping)}<br>Grand Total: ${money(order.totals?.grandTotal)}</div><p>Status: ${order.status}</p><script>window.onload=()=>window.print()</script></body></html>`);
        win.document.close();
    };

    /* =====================================================
       STATUS COLORS
       ===================================================== */

    const getStatusColor = status => {
        switch (status) {
            case 'Delivered':
                return {
                    bg: '#14532d',
                    color: '#86efac'
                };

            case 'Shipped':
                return {
                    bg: '#1e3a8a',
                    color: '#93c5fd'
                };

            case 'Processing':
                return {
                    bg: '#78350f',
                    color: '#fde047'
                };

            case 'Approved':
                return {
                    bg: '#14532d',
                    color: '#86efac'
                };

            case 'Cancelled':
                return {
                    bg: '#7f1d1d',
                    color: '#fca5a5'
                };

            default:
                return {
                    bg: '#431407',
                    color: '#fdba74'
                };
        }
    };

    /* =====================================================
       IMAGE UPLOAD
       ===================================================== */

    const handleImageUpload = event => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be below 5MB');
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            const base64 = reader.result;

            setImagePreview(base64);

            setNewProduct(prev => ({
                ...prev,
                image: base64
            }));
        };

        reader.readAsDataURL(file);
    };

    /* =====================================================
       ADD PRODUCT
       ===================================================== */

    const handleAddNewProduct = async event => {
        event.preventDefault();

        if (!newProduct.n.trim()) {
            alert('Enter product name');
            return;
        }

        if (!newProduct.p) {
            alert('Enter selling price');
            return;
        }

        const sizesArray = newProduct.sizes
            .split(',')
            .map(size => size.trim())
            .filter(Boolean);

        const colorsArray = newProduct.colors
            ? newProduct.colors
                  .split(',')
                  .map(color => ({
                      name: color.trim(),
                      hex: '#cccccc'
                  }))
                  .filter(color => color.name)
            : [
                  {
                      name: 'Default',
                      hex: '#cccccc'
                  }
              ];

        const productToAdd = {
            id: Date.now(),

            n: newProduct.n.trim(),

            c: newProduct.c,

            a: newProduct.a,

            p: Number(newProduct.p),

            o: newProduct.o
                ? Number(newProduct.o)
                : null,

            k: 'dress',

            bg: '#fbd5df',

            fg: '#c2410c',

            t: newProduct.t || 'New',

            image: newProduct.image || '',

            rating: 5,

            reviewsCount: 0,

            fabric:
                newProduct.fabric ||
                'Premium Quality',

            sizes:
                sizesArray.length > 0
                    ? sizesArray
                    : ['Free Size'],

            colors: colorsArray,

            description:
                newProduct.description ||
                `${newProduct.n} - Premium quality product from JP Clothing.`,

            washCare:
                'Machine wash cold with like colors.',

            isCustom: true
        };

        try {
            await onAddProduct(productToAdd);

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

            setTimeout(() => {
                setAddSuccess(false);
            }, 3000);
        } catch (error) {
            alert(
                error?.message ||
                'Unable to add product'
            );
        }
    };

    /* =====================================================
       DELETE PRODUCT
       ===================================================== */

    const handleDeleteProduct = async product => {
        const productId =
            product._id || product.id;

        if (!productId) {
            alert('Product ID not found.');
            return;
        }

        const confirmed = window.confirm(
            `Delete "${product.n}" permanently?\n\nThis action cannot be undone.`
        );

        if (!confirmed) return;

        try {
            await onDeleteProduct(
                productId,
                product.source === 'builtin'
                    ? 'builtin'
                    : 'custom'
            );

            alert(
                `"${product.n}" deleted successfully.`
            );
        } catch (error) {
            alert(
                error?.message ||
                'Unable to delete product.'
            );
        }
    };

    /* =====================================================
       STYLES
       ===================================================== */

    const tabBtnStyle = active => ({
        padding: '8px 18px',
        borderRadius: '999px',
        border: active
            ? '2px solid var(--brand)'
            : '1px solid var(--line)',
        background: active
            ? 'var(--brand)'
            : 'var(--card)',
        color: active
            ? 'var(--brand-ink)'
            : 'var(--ink)',
        fontWeight: 800,
        fontSize: '0.85rem',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
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
        marginBottom: '5px'
    };

    /* =====================================================
       UI
       ===================================================== */

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 100,
                background: 'var(--bg)',
                color: 'var(--ink)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
            }}
        >
            {/* ================= NAVBAR ================= */}

            <div
                style={{
                    background: 'var(--card)',
                    borderBottom:
                        '1px solid var(--line)',
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <div
                        style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border:
                                '1px solid var(--brand)'
                        }}
                    >
                        <img
                            src="/images/jp_logo.jpeg"
                            alt="JP Logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    <div>
                        <div
                            style={{
                                fontFamily:
                                    'Cinzel, serif',
                                fontWeight: 800,
                                fontSize: '1.15rem'
                            }}
                        >
                            JP CLOTHING ADMIN
                        </div>

                        <span
                            style={{
                                color: 'var(--mute)',
                                fontSize: '0.74rem',
                                fontStyle: 'italic'
                            }}
                        >
                            Styles that defines you ..
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                    }}
                >
                    <button
                        onClick={onMarkOrdersRead}
                        style={{
                            position: 'relative',
                            background: 'var(--bg)',
                            border:
                                '1px solid var(--line)',
                            borderRadius: '50%',
                            width: '42px',
                            height: '42px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        <Bell
                            size={20}
                            color={
                                unreadCount > 0
                                    ? 'var(--brand)'
                                    : 'var(--ink)'
                            }
                        />

                        {unreadCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    background:
                                        'var(--accent)',
                                    color: '#fff',
                                    fontWeight: 800,
                                    fontSize: '0.74rem',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={onLogout}
                        style={{
                            background:
                                'transparent',
                            color: 'var(--brand)',
                            border:
                                '1px solid var(--brand)',
                            borderRadius: '999px',
                            padding: '6px 16px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <LogOut size={16} />
                        Exit Admin
                    </button>
                </div>
            </div>

            {/* ================= MAIN ================= */}

            <div
                style={{
                    maxWidth: '1200px',
                    width: '100%',
                    margin: '0 auto',
                    padding:
                        '24px 16px 48px'
                }}
            >
                {/* ================= TABS ================= */}

                <div
                    style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '24px',
                        flexWrap: 'wrap'
                    }}
                >
                    <button
                        onClick={() =>
                            setActiveTab('orders')
                        }
                        style={tabBtnStyle(
                            activeTab === 'orders'
                        )}
                    >
                        <ShoppingBag size={16} />
                        Orders
                        {orders.length > 0 &&
                            ` (${orders.length})`}
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab('products')
                        }
                        style={tabBtnStyle(
                            activeTab === 'products'
                        )}
                    >
                        <Package size={16} />
                        My Products
                        {uniqueProducts.length > 0 &&
                            ` (${uniqueProducts.length})`}
                    </button>

                    <button
                        onClick={() =>
                            setActiveTab(
                                'addProduct'
                            )
                        }
                        style={tabBtnStyle(
                            activeTab === 'addProduct'
                        )}
                    >
                        <Plus size={16} />
                        Add New Product
                    </button>
                </div>

                {/* =================================================
                    ORDERS
                ================================================= */}

                {activeTab === 'orders' && (
                    <>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fit,minmax(220px,1fr))',
                                gap: '16px',
                                marginBottom:
                                    '28px'
                            }}
                        >
                            <div
                                style={{
                                    background:
                                        'var(--card)',
                                    border:
                                        '1px solid var(--line)',
                                    borderRadius:
                                        'var(--radius-md)',
                                    padding: '20px'
                                }}
                            >
                                <div
                                    style={{
                                        color:
                                            'var(--mute)',
                                        fontSize:
                                            '0.85rem',
                                        fontWeight: 700
                                    }}
                                >
                                    TOTAL REVENUE
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            '1.8rem',
                                        fontWeight: 800,
                                        color:
                                            'var(--brand)',
                                        marginTop:
                                            '6px'
                                    }}
                                >
                                    ₹
                                    {totalRevenue.toLocaleString(
                                        'en-IN'
                                    )}
                                </div>
                            </div>

                            <div
                                style={{
                                    background:
                                        'var(--card)',
                                    border:
                                        '1px solid var(--line)',
                                    borderRadius:
                                        'var(--radius-md)',
                                    padding: '20px'
                                }}
                            >
                                <div
                                    style={{
                                        color:
                                            'var(--mute)',
                                        fontSize:
                                            '0.85rem',
                                        fontWeight: 700
                                    }}
                                >
                                    TOTAL ORDERS
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            '1.8rem',
                                        fontWeight: 800,
                                        marginTop:
                                            '6px'
                                    }}
                                >
                                    {orders.length}
                                </div>
                            </div>

                            <div
                                style={{
                                    background:
                                        'var(--card)',
                                    border:
                                        '1px solid var(--line)',
                                    borderRadius:
                                        'var(--radius-md)',
                                    padding: '20px'
                                }}
                            >
                                <div
                                    style={{
                                        color:
                                            'var(--mute)',
                                        fontSize:
                                            '0.85rem',
                                        fontWeight: 700
                                    }}
                                >
                                    NEW NOTIFICATIONS
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            '1.8rem',
                                        fontWeight: 800,
                                        color:
                                            unreadCount >
                                            0
                                                ? 'var(--brand)'
                                                : 'var(--ink)',
                                        marginTop:
                                            '6px'
                                    }}
                                >
                                    {unreadCount}
                                </div>
                            </div>

                            <div
                                style={{
                                    background:
                                        'var(--card)',
                                    border:
                                        '1px solid var(--line)',
                                    borderRadius:
                                        'var(--radius-md)',
                                    padding: '20px'
                                }}
                            >
                                <div
                                    style={{
                                        color:
                                            'var(--mute)',
                                        fontSize:
                                            '0.85rem',
                                        fontWeight: 700
                                    }}
                                >
                                    PENDING DISPATCH
                                </div>

                                <div
                                    style={{
                                        fontSize:
                                            '1.8rem',
                                        fontWeight: 800,
                                        color:
                                            '#f5d061',
                                        marginTop:
                                            '6px'
                                    }}
                                >
                                    {pendingCount}
                                </div>
                            </div>
                        </div>

                        {/* ORDERS TABLE */}

                        <div
                            style={{
                                background:
                                    'var(--card)',
                                border:
                                    '1px solid var(--line)',
                                borderRadius:
                                    'var(--radius-lg)',
                                overflow: 'hidden'
                            }}
                        >
                            <div
                                style={{
                                    padding:
                                        '16px 20px',
                                    borderBottom:
                                        '1px solid var(--line)',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '12px',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'space-between'
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize:
                                            '1.25rem',
                                        color:
                                            'var(--brand)'
                                    }}
                                >
                                    Live JP CLOTHING
                                    Orders (
                                    {
                                        filteredOrders.length
                                    }
                                    )
                                </h2>

                                <div
                                    style={{
                                        display: 'flex',
                                        gap: '8px',
                                        flexWrap:
                                            'wrap'
                                    }}
                                >
                                    <select
                                        value={
                                            statusFilter
                                        }
                                        onChange={e =>
                                            setStatusFilter(
                                                e.target
                                                    .value
                                            )
                                        }
                                        style={{
                                            padding:
                                                '7px 10px',
                                            borderRadius:
                                                '8px',
                                            border:
                                                '1px solid var(--line)',
                                            background:
                                                'var(--card)',
                                            color:
                                                'var(--ink)'
                                        }}
                                    >
                                        <option>
                                            All
                                        </option>
                                        <option>
                                            Pending
                                        </option>
                                        <option>
                                            Approved
                                        </option>
                                        <option>
                                            Processing
                                        </option>
                                        <option>
                                            Shipped
                                        </option>
                                        <option>
                                            Delivered
                                        </option>
                                        <option>
                                            Cancelled
                                        </option>
                                    </select>

                                    <div
                                        style={{
                                            position:
                                                'relative',
                                            width:
                                                '220px'
                                        }}
                                    >
                                        <Search
                                            size={14}
                                            style={{
                                                position:
                                                    'absolute',
                                                left:
                                                    '10px',
                                                top:
                                                    '50%',
                                                transform:
                                                    'translateY(-50%)',
                                                color:
                                                    'var(--mute)'
                                            }}
                                        />

                                        <input
                                            placeholder="Search order..."
                                            value={
                                                searchTerm
                                            }
                                            onChange={e =>
                                                setSearchTerm(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            style={{
                                                width:
                                                    '100%',
                                                padding:
                                                    '7px 10px 7px 30px',
                                                borderRadius:
                                                    '8px',
                                                border:
                                                    '1px solid var(--line)',
                                                background:
                                                    'var(--card)',
                                                color:
                                                    'var(--ink)'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    overflowX:
                                        'auto'
                                }}
                            >
                                <table
                                    style={{
                                        width: '100%',
                                        borderCollapse:
                                            'collapse',
                                        textAlign:
                                            'left'
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th
                                                style={{
                                                    padding:
                                                        '12px'
                                                }}
                                            >
                                                Order ID
                                            </th>

                                            <th
                                                style={{
                                                    padding:
                                                        '12px'
                                                }}
                                            >
                                                Customer
                                            </th>

                                            <th
                                                style={{
                                                    padding:
                                                        '12px'
                                                }}
                                            >
                                                Items
                                            </th>

                                            <th
                                                style={{
                                                    padding:
                                                        '12px'
                                                }}
                                            >
                                                Total
                                            </th>

                                            <th
                                                style={{
                                                    padding:
                                                        '12px'
                                                }}
                                            >
                                                Status
                                            </th>

                                            <th
                                                style={{
                                                    padding:
                                                        '12px',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredOrders.map(
                                            order => {
                                                const color =
                                                    getStatusColor(
                                                        order.status
                                                    );

                                                return (
                                                    <tr
                                                        key={
                                                            order.id
                                                        }
                                                        style={{
                                                            borderTop:
                                                                '1px solid var(--line)'
                                                        }}
                                                    >
                                                        <td
                                                            style={{
                                                                padding:
                                                                    '14px',
                                                                color:
                                                                    'var(--brand)',
                                                                fontWeight:
                                                                    800
                                                            }}
                                                        >
                                                            {
                                                                order.id
                                                            }
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding:
                                                                    '14px'
                                                            }}
                                                        >
                                                            <strong>
                                                                {
                                                                    order
                                                                        .customer
                                                                        ?.name
                                                                }
                                                            </strong>

                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        '0.78rem',
                                                                    color:
                                                                        'var(--mute)'
                                                                }}
                                                            >
                                                                📞{' '}
                                                                {
                                                                    order
                                                                        .customer
                                                                        ?.phone
                                                                }
                                                            </div>
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding:
                                                                    '14px'
                                                            }}
                                                        >
                                                            {order.items?.map(
                                                                (
                                                                    item,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                    >
                                                                        •{' '}
                                                                        {
                                                                            item.n
                                                                        }{' '}
                                                                        x{' '}
                                                                        {
                                                                            item.quantity ||
                                                                            1
                                                                        }
                                                                    </div>
                                                                )
                                                            )}
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding:
                                                                    '14px',
                                                                color:
                                                                    'var(--brand)',
                                                                fontWeight:
                                                                    800
                                                            }}
                                                        >
                                                            ₹
                                                            {
                                                                order
                                                                    .totals
                                                                    ?.grandTotal
                                                            }
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding:
                                                                    '14px'
                                                            }}
                                                        >
                                                            <select
                                                                value={
                                                                    order.status
                                                                }
                                                                onChange={e =>
                                                                    onUpdateOrderStatus(
                                                                        order.id,
                                                                        e
                                                                            .target
                                                                            .value
                                                                    )
                                                                }
                                                                style={{
                                                                    background:
                                                                        color.bg,
                                                                    color:
                                                                        color.color,
                                                                    borderRadius:
                                                                        '999px',
                                                                    padding:
                                                                        '6px 12px',
                                                                    fontWeight:
                                                                        800
                                                                }}
                                                            >
                                                                <option value="Pending">
                                                                    🕒
                                                                    Pending
                                                                </option>

                                                                <option value="Approved">
                                                                    ✅
                                                                    Approved
                                                                </option>

                                                                <option value="Processing">
                                                                    📦
                                                                    Processing
                                                                </option>

                                                                <option value="Shipped">
                                                                    🚚
                                                                    Shipped
                                                                </option>

                                                                <option value="Delivered">
                                                                    ✅
                                                                    Delivered
                                                                </option>

                                                                <option value="Cancelled">
                                                                    ❌
                                                                    Cancelled
                                                                </option>
                                                            </select>
                                                            <button type="button" onClick={() => printInvoice(order)} style={{display:'block',marginTop:8,padding:'7px 10px',borderRadius:8,border:'1px solid var(--brand)',background:'transparent',color:'var(--brand)',fontWeight:800,cursor:'pointer'}}>View / Print Invoice</button>
                                                        </td>

                                                        <td
                                                            style={{
                                                                padding: '14px',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={() => onDeleteOrder?.(order.id)}
                                                                title="Delete order"
                                                                style={{
                                                                    border: '1px solid #7f1d1d',
                                                                    background: '#450a0a',
                                                                    color: '#fca5a5',
                                                                    borderRadius: '8px',
                                                                    padding: '8px 10px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center'
                                                                }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                {activeTab === 'products' && (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent:
                                    'space-between',
                                alignItems:
                                    'center',
                                marginBottom:
                                    '20px',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}
                        >
                            <div>
                                <h2
                                    style={{
                                        fontSize:
                                            '1.3rem',
                                        color:
                                            'var(--brand)'
                                    }}
                                >
                                    📦 My Product
                                    Catalog (
                                    {
                                        uniqueProducts.length
                                    }
                                    )
                                </h2>

                                <p
                                    style={{
                                        color:
                                            'var(--mute)',
                                        fontSize:
                                            '0.85rem'
                                    }}
                                >
                                    Manage existing
                                    products and
                                    admin-added
                                    products.
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setActiveTab(
                                        'addProduct'
                                    )
                                }
                                style={tabBtnStyle(
                                    false
                                )}
                            >
                                <Plus size={16} />
                                Add New
                            </button>
                        </div>

                        {/* PRODUCT GRID */}

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns:
                                    'repeat(auto-fill,minmax(280px,1fr))',
                                gap: '16px'
                            }}
                        >
                            {uniqueProducts.map(
                                product => {
                                    const productKey =
                                        product._id ||
                                        product.id;

                                    return (
                                        <div
                                            key={String(
                                                productKey
                                            )}
                                            style={{
                                                background:
                                                    'var(--card)',
                                                border:
                                                    '1px solid var(--line)',
                                                borderRadius:
                                                    'var(--radius-md)',
                                                overflow:
                                                    'hidden'
                                            }}
                                        >
                                            {/* IMAGE */}

                                            <div
                                                style={{
                                                    height:
                                                        '180px',
                                                    background:
                                                        product.bg ||
                                                        '#28050b',
                                                    display:
                                                        'flex',
                                                    alignItems:
                                                        'center',
                                                    justifyContent:
                                                        'center',
                                                    overflow:
                                                        'hidden',
                                                    position:
                                                        'relative'
                                                }}
                                            >
                                                {product.image ? (
                                                    <img
                                                        src={
                                                            product.image
                                                        }
                                                        alt={
                                                            product.n
                                                        }
                                                        style={{
                                                            width:
                                                                '100%',
                                                            height:
                                                                '100%',
                                                            objectFit:
                                                                'cover'
                                                        }}
                                                    />
                                                ) : (
                                                    <ImageIcon
                                                        size={
                                                            48
                                                        }
                                                        color="var(--mute)"
                                                    />
                                                )}

                                                <div
                                                    style={{
                                                        position:
                                                            'absolute',
                                                        top:
                                                            '8px',
                                                        left:
                                                            '8px',
                                                        display:
                                                            'flex',
                                                        gap:
                                                            '5px',
                                                        flexWrap:
                                                            'wrap'
                                                    }}
                                                >
                                                    {product.t && (
                                                        <span
                                                            style={{
                                                                background:
                                                                    product.t ===
                                                                    'Sale'
                                                                        ? 'var(--accent)'
                                                                        : 'var(--brand)',
                                                                color:
                                                                    '#fff',
                                                                padding:
                                                                    '3px 8px',
                                                                borderRadius:
                                                                    '999px',
                                                                fontSize:
                                                                    '0.7rem',
                                                                fontWeight:
                                                                    800
                                                            }}
                                                        >
                                                            {
                                                                product.t
                                                            }
                                                        </span>
                                                    )}

                                                    {product.isCustom && (
                                                        <span
                                                            style={{
                                                                background:
                                                                    '#25d366',
                                                                color:
                                                                    '#fff',
                                                                padding:
                                                                    '3px 8px',
                                                                borderRadius:
                                                                    '999px',
                                                                fontSize:
                                                                    '0.7rem',
                                                                fontWeight:
                                                                    800
                                                            }}
                                                        >
                                                            ADMIN
                                                        </span>
                                                    )}

                                                    {product.isBuiltIn && (
                                                        <span
                                                            style={{
                                                                background:
                                                                    '#2563eb',
                                                                color:
                                                                    '#fff',
                                                                padding:
                                                                    '3px 8px',
                                                                borderRadius:
                                                                    '999px',
                                                                fontSize:
                                                                    '0.7rem',
                                                                fontWeight:
                                                                    800
                                                            }}
                                                        >
                                                            STORE
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* INFO */}

                                            <div
                                                style={{
                                                    padding:
                                                        '14px 16px'
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        justifyContent:
                                                            'space-between',
                                                        gap:
                                                            '10px'
                                                    }}
                                                >
                                                    <div>
                                                        <h3
                                                            style={{
                                                                fontSize:
                                                                    '1rem',
                                                                fontWeight:
                                                                    800,
                                                                margin:
                                                                    '0 0 3px'
                                                            }}
                                                        >
                                                            {
                                                                product.n
                                                            }
                                                        </h3>

                                                        <span
                                                            style={{
                                                                fontSize:
                                                                    '0.8rem',
                                                                color:
                                                                    'var(--mute)'
                                                            }}
                                                        >
                                                            {
                                                                product.c
                                                            }{' '}
                                                            •{' '}
                                                            {
                                                                product.a
                                                            }
                                                        </span>
                                                    </div>

                                                    <div
                                                        style={{
                                                            textAlign:
                                                                'right'
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontWeight:
                                                                    800,
                                                                color:
                                                                    'var(--brand)'
                                                            }}
                                                        >
                                                            ₹
                                                            {
                                                                product.p
                                                            }
                                                        </div>

                                                        {product.o && (
                                                            <s
                                                                style={{
                                                                    fontSize:
                                                                        '0.78rem',
                                                                    color:
                                                                        'var(--mute)'
                                                                }}
                                                            >
                                                                ₹
                                                                {
                                                                    product.o
                                                                }
                                                            </s>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* SIZES */}

                                                <div
                                                    style={{
                                                        display:
                                                            'flex',
                                                        gap:
                                                            '5px',
                                                        flexWrap:
                                                            'wrap',
                                                        marginTop:
                                                            '10px'
                                                    }}
                                                >
                                                    {product.sizes
                                                        ?.slice(
                                                            0,
                                                            5
                                                        )
                                                        .map(
                                                            (
                                                                size,
                                                                index
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        index
                                                                    }
                                                                    style={{
                                                                        padding:
                                                                            '3px 8px',
                                                                        background:
                                                                            'var(--bg)',
                                                                        border:
                                                                            '1px solid var(--line)',
                                                                        borderRadius:
                                                                            '6px',
                                                                        fontSize:
                                                                            '0.72rem',
                                                                        fontWeight:
                                                                            700
                                                                    }}
                                                                >
                                                                    {
                                                                        size
                                                                    }
                                                                </span>
                                                            )
                                                        )}
                                                </div>

                                                {/* DELETE */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteProduct(
                                                            product
                                                        )
                                                    }
                                                    style={{
                                                        marginTop:
                                                            '12px',
                                                        width:
                                                            '100%',
                                                        padding:
                                                            '9px',
                                                        borderRadius:
                                                            '8px',
                                                        border:
                                                            '1px solid #f43f5e',
                                                        background:
                                                            'rgba(244,63,94,0.1)',
                                                        color:
                                                            '#f43f5e',
                                                        fontWeight:
                                                            800,
                                                        cursor:
                                                            'pointer',
                                                        display:
                                                            'flex',
                                                        alignItems:
                                                            'center',
                                                        justifyContent:
                                                            'center',
                                                        gap:
                                                            '6px'
                                                    }}
                                                >
                                                    <Trash2
                                                        size={
                                                            14
                                                        }
                                                    />

                                                    Delete Product
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        {uniqueProducts.length ===
                            0 && (
                            <div
                                style={{
                                    textAlign:
                                        'center',
                                    padding:
                                        '60px 20px',
                                    color:
                                        'var(--mute)'
                                }}
                            >
                                <Package
                                    size={48}
                                    style={{
                                        opacity: 0.3
                                    }}
                                />

                                <p
                                    style={{
                                        fontSize:
                                            '1.1rem',
                                        fontWeight:
                                            700
                                    }}
                                >
                                    No products yet
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* =================================================
                    ADD PRODUCT
                ================================================= */}

                {activeTab === 'addProduct' && (
                    <div
                        style={{
                            maxWidth: '700px',
                            margin: '0 auto'
                        }}
                    >
                        <h2
                            style={{
                                fontSize:
                                    '1.4rem',
                                color:
                                    'var(--brand)',
                                marginBottom:
                                    '6px'
                            }}
                        >
                            ➕ Add New Product
                        </h2>

                        <p
                            style={{
                                color:
                                    'var(--mute)',
                                marginBottom:
                                    '24px'
                            }}
                        >
                            Add product photo,
                            pricing, sizes and
                            details.
                        </p>

                        {addSuccess && (
                            <div
                                style={{
                                    background:
                                        'rgba(34,197,94,0.15)',
                                    border:
                                        '1px solid #22c55e',
                                    color:
                                        '#22c55e',
                                    padding:
                                        '12px 18px',
                                    borderRadius:
                                        '10px',
                                    marginBottom:
                                        '20px',
                                    fontWeight: 800
                                }}
                            >
                                <CheckCircle2
                                    size={18}
                                    style={{
                                        verticalAlign:
                                            'middle',
                                        marginRight:
                                            '6px'
                                    }}
                                />
                                Product added
                                successfully! 🎉
                            </div>
                        )}

                        <form
                            onSubmit={
                                handleAddNewProduct
                            }
                            style={{
                                background:
                                    'var(--card)',
                                border:
                                    '1px solid var(--line)',
                                borderRadius:
                                    'var(--radius-lg)',
                                padding: '28px',
                                display:
                                    'flex',
                                flexDirection:
                                    'column',
                                gap: '18px'
                            }}
                        >
                            {/* IMAGE */}

                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    📷 Product Photo
                                </label>

                                <div
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    style={{
                                        height:
                                            '220px',
                                        border:
                                            '2px dashed var(--brand)',
                                        borderRadius:
                                            '12px',
                                        display:
                                            'flex',
                                        alignItems:
                                            'center',
                                        justifyContent:
                                            'center',
                                        flexDirection:
                                            'column',
                                        cursor:
                                            'pointer',
                                        overflow:
                                            'hidden'
                                    }}
                                >
                                    {imagePreview ? (
                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Preview"
                                            style={{
                                                width:
                                                    '100%',
                                                height:
                                                    '100%',
                                                objectFit:
                                                    'cover'
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <Upload
                                                size={
                                                    36
                                                }
                                                color="var(--brand)"
                                            />

                                            <strong>
                                                Click to
                                                Upload
                                            </strong>

                                            <small
                                                style={{
                                                    color:
                                                        'var(--mute)'
                                                }}
                                            >
                                                JPG, PNG,
                                                WebP
                                            </small>
                                        </>
                                    )}
                                </div>

                                <input
                                    ref={
                                        fileInputRef
                                    }
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleImageUpload
                                    }
                                    style={{
                                        display:
                                            'none'
                                    }}
                                />
                            </div>

                            {/* NAME */}

                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Product Name *
                                </label>

                                <input
                                    required
                                    value={
                                        newProduct.n
                                    }
                                    onChange={e =>
                                        setNewProduct(
                                            prev => ({
                                                ...prev,
                                                n: e.target
                                                    .value
                                            })
                                        )
                                    }
                                    placeholder="Premium Cotton Kurta"
                                    style={
                                        inputStyle
                                    }
                                />
                            </div>

                            {/* STOCK QUANTITY */}
                            <div>
                                <label style={labelStyle}>Available Stock *</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={newProduct.stock ?? 0}
                                    onChange={e => setNewProduct(prev => ({ ...prev, stock: Math.max(0, Number(e.target.value)) }))}
                                    placeholder="e.g. 25"
                                    style={inputStyle}
                                />
                                <small style={{color:'#9ca3af'}}>Customers will see the available quantity on product cards.</small>
                            </div>

                            {/* CATEGORY */}

                            <div
                                style={{
                                    display:
                                        'grid',
                                    gridTemplateColumns:
                                        '1fr 1fr',
                                    gap: '14px'
                                }}
                            >
                                <div>
                                    <label
                                        style={
                                            labelStyle
                                        }
                                    >
                                        Category
                                    </label>

                                    <select
                                        value={
                                            newProduct.c
                                        }
                                        onChange={e =>
                                            setNewProduct(
                                                prev => ({
                                                    ...prev,
                                                    c: e.target
                                                        .value
                                                })
                                            )
                                        }
                                        style={
                                            inputStyle
                                        }
                                    >
                                        <option>
                                            Boys
                                        </option>
                                        <option>
                                            Girls
                                        </option>
                                        <option>
                                            Infants
                                        </option>
                                        <option>
                                            Unisex
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label
                                        style={
                                            labelStyle
                                        }
                                    >
                                        Age Range
                                    </label>

                                    <select
                                        value={
                                            newProduct.a
                                        }
                                        onChange={e =>
                                            setNewProduct(
                                                prev => ({
                                                    ...prev,
                                                    a: e.target
                                                        .value
                                                })
                                            )
                                        }
                                        style={
                                            inputStyle
                                        }
                                    >
                                        <option>
                                            0–6 mo
                                        </option>
                                        <option>
                                            0–2 yrs
                                        </option>
                                        <option>
                                            1–7 yrs
                                        </option>
                                        <option>
                                            2–8 yrs
                                        </option>
                                        <option>
                                            2–10 yrs
                                        </option>
                                        <option>
                                            All Ages
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* PRICE */}

                            <div
                                style={{
                                    display:
                                        'grid',
                                    gridTemplateColumns:
                                        '1fr 1fr 1fr',
                                    gap: '14px'
                                }}
                            >
                                <div>
                                    <label
                                        style={
                                            labelStyle
                                        }
                                    >
                                        Selling Price *
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={
                                            newProduct.p
                                        }
                                        onChange={e =>
                                            setNewProduct(
                                                prev => ({
                                                    ...prev,
                                                    p: e.target
                                                        .value
                                                })
                                            )
                                        }
                                        style={
                                            inputStyle
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        style={
                                            labelStyle
                                        }
                                    >
                                        MRP
                                    </label>

                                    <input
                                        type="number"
                                        value={
                                            newProduct.o
                                        }
                                        onChange={e =>
                                            setNewProduct(
                                                prev => ({
                                                    ...prev,
                                                    o: e.target
                                                        .value
                                                })
                                            )
                                        }
                                        style={
                                            inputStyle
                                        }
                                    />
                                </div>

                                <div>
                                    <label
                                        style={
                                            labelStyle
                                        }
                                    >
                                        Tag
                                    </label>

                                    <select
                                        value={
                                            newProduct.t
                                        }
                                        onChange={e =>
                                            setNewProduct(
                                                prev => ({
                                                    ...prev,
                                                    t: e.target
                                                        .value
                                                })
                                            )
                                        }
                                        style={
                                            inputStyle
                                        }
                                    >
                                        <option>
                                            New
                                        </option>
                                        <option>
                                            Sale
                                        </option>
                                        <option>
                                            Bestseller
                                        </option>
                                        <option>
                                            Trending
                                        </option>
                                        <option>
                                            Popular
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {/* FABRIC */}

                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Fabric
                                </label>

                                <input
                                    value={
                                        newProduct.fabric
                                    }
                                    onChange={e =>
                                        setNewProduct(
                                            prev => ({
                                                ...prev,
                                                fabric: e.target
                                                    .value
                                            })
                                        )
                                    }
                                    placeholder="100% Cotton"
                                    style={
                                        inputStyle
                                    }
                                />
                            </div>

                            {/* SIZES */}

                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Sizes
                                </label>

                                <input
                                    value={
                                        newProduct.sizes
                                    }
                                    onChange={e =>
                                        setNewProduct(
                                            prev => ({
                                                ...prev,
                                                sizes: e.target
                                                    .value
                                            })
                                        )
                                    }
                                    placeholder="2-3Y, 4-5Y, 6-7Y"
                                    style={
                                        inputStyle
                                    }
                                />
                            </div>

                            {/* COLORS */}

                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Colors
                                </label>

                                <input
                                    value={
                                        newProduct.colors
                                    }
                                    onChange={e =>
                                        setNewProduct(
                                            prev => ({
                                                ...prev,
                                                colors: e.target
                                                    .value
                                            })
                                        )
                                    }
                                    placeholder="Red, Blue, Pink"
                                    style={
                                        inputStyle
                                    }
                                />
                            </div>

                            {/* DESCRIPTION */}

                            <div>
                                <label
                                    style={
                                        labelStyle
                                    }
                                >
                                    Description
                                </label>

                                <textarea
                                    rows={4}
                                    value={
                                        newProduct.description
                                    }
                                    onChange={e =>
                                        setNewProduct(
                                            prev => ({
                                                ...prev,
                                                description:
                                                    e.target
                                                        .value
                                            })
                                        )
                                    }
                                    style={{
                                        ...inputStyle,
                                        resize:
                                            'vertical'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    fontSize:
                                        '1rem',
                                    display:
                                        'flex',
                                    alignItems:
                                        'center',
                                    justifyContent:
                                        'center',
                                    gap: '8px'
                                }}
                            >
                                <Plus size={20} />
                                Add Product to Store
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}