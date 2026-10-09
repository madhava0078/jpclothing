import React, { useState, useEffect, useCallback } from 'react';

import {
    api,
    getAuthToken
} from './lib/api';

import Header from './components/Header';
import PromoBanner from './components/PromoBanner';
import Hero from './components/Hero';
import FilterTools from './components/FilterTools';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import UserOrdersModal from './components/UserOrdersModal';
import Toast from './components/Toast';
import Footer from './components/Footer';

export default function App() {

    // =========================================================
    // SHOP STATE
    // =========================================================

    const [activeCategory, setActiveCategory] = useState('All');
    const [activeAge, setActiveAge] = useState('All Ages');
    const [sortOption, setSortOption] = useState('f');
    const [searchQuery, setSearchQuery] = useState('');

    // =========================================================
    // USER AUTH
    // =========================================================

    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem('jp_user');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.warn('User restore error:', error);
            return null;
        }
    });

    // =========================================================
    // ORDERS / PRODUCTS
    // =========================================================

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);

    const allProducts = products;

    // =========================================================
    // CART
    // =========================================================

    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('jp_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });

    // =========================================================
    // WISHLIST
    // =========================================================

    const [wishlistItems, setWishlistItems] = useState(() => {
        try {
            const saved = localStorage.getItem('jp_wishlist');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            return [];
        }
    });

    // =========================================================
    // THEME
    // =========================================================

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('jp_theme') || 'dark';
    });

    // =========================================================
    // MODALS
    // =========================================================

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isWishlistOpen, setIsWishlistOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authInitialTab, setAuthInitialTab] = useState('user');

    const [isUserOrdersOpen, setIsUserOrdersOpen] = useState(false);

    const [checkoutTotals, setCheckoutTotals] = useState(null);

    // =========================================================
    // TOAST
    // =========================================================

    const [toastMessage, setToastMessage] = useState('');

    // =========================================================
    // INVOICE
    // =========================================================

    const [invoiceOrder, setInvoiceOrder] = useState(null);

    // =========================================================
    // THEME SYNC
    // =========================================================

    useEffect(() => {
        document.documentElement.setAttribute(
            'data-theme',
            theme
        );

        localStorage.setItem(
            'jp_theme',
            theme
        );
    }, [theme]);

    // =========================================================
    // CART LOCAL STORAGE
    // =========================================================

    useEffect(() => {
        localStorage.setItem(
            'jp_cart',
            JSON.stringify(cartItems)
        );
    }, [cartItems]);

    // =========================================================
    // WISHLIST LOCAL STORAGE
    // =========================================================

    useEffect(() => {
        localStorage.setItem(
            'jp_wishlist',
            JSON.stringify(wishlistItems)
        );
    }, [wishlistItems]);

    // =========================================================
    // USER LOCAL STORAGE
    // =========================================================

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem(
                'jp_user',
                JSON.stringify(currentUser)
            );
        } else {
            localStorage.removeItem('jp_user');
        }
    }, [currentUser]);

    // =========================================================
    // LOAD PRODUCTS
    // =========================================================

    useEffect(() => {

        let cancelled = false;

        const loadProducts = async () => {

            try {

                const data = await api.getProducts();

                if (!cancelled) {
                    setProducts(
                        Array.isArray(data)
                            ? data
                            : []
                    );
                }

            } catch (error) {

                console.warn(
                    'Products API:',
                    error.message
                );

            }

        };

        loadProducts();

        // Keep customer products synced with Admin Panel
        const productTimer = setInterval(
            loadProducts,
            10000
        );

        return () => {

            cancelled = true;

            clearInterval(
                productTimer
            );

        };

    }, []);

    // =========================================================
    // ⭐ LOAD USER ORDERS
    // =========================================================
    //
    // IMPORTANT:
    // Backend /api/orders/me already returns ONLY
    // the logged-in user's orders.
    //
    // So we do NOT filter by customer name/phone/email
    // on frontend.
    //
    // =========================================================

    const refreshUserOrders = useCallback(
        async (showError = false) => {

            if (!currentUser || !getAuthToken()) {

                setOrders([]);

                return [];

            }

            try {

                const latestOrders =
                    await api.getMyOrders();

                const safeOrders =
                    Array.isArray(latestOrders)
                        ? latestOrders
                        : [];

                setOrders(
                    previousOrders => {

                        const previousById =
                            new Map(
                                previousOrders.map(
                                    order => [
                                        String(order.id),
                                        order
                                    ]
                                )
                            );

                        // -------------------------------------------------
                        // Detect Approved status change
                        // -------------------------------------------------

                        const newlyApproved =
                            safeOrders.find(order => {

                                const oldOrder =
                                    previousById.get(
                                        String(order.id)
                                    );

                                return (
                                    order.status === 'Approved' &&
                                    oldOrder &&
                                    oldOrder.status !== 'Approved'
                                );

                            });

                        if (newlyApproved) {

                            setInvoiceOrder(
                                newlyApproved
                            );

                        }

                        // -------------------------------------------------
                        // VERY IMPORTANT
                        //
                        // Replace old state completely.
                        //
                        // Do NOT merge old orders here.
                        // This guarantees MongoDB's latest status
                        // is what the customer sees.
                        // -------------------------------------------------

                        return safeOrders;

                    }
                );

                return safeOrders;

            } catch (error) {

                if (showError) {

                    showToast(
                        error.message ||
                        'Unable to load orders'
                    );

                }

                console.warn(
                    'Order refresh failed:',
                    error.message
                );

                return [];

            }

        },
        [currentUser]
    );

    // =========================================================
    // ⭐ LIVE TRACKING
    // =========================================================
    //
    // Customer side automatically checks MongoDB
    // every 5 seconds.
    //
    // Pending
    // Approved
    // Processing
    // Shipped
    // Delivered
    //
    // =========================================================

    useEffect(() => {

        if (
            !currentUser ||
            !getAuthToken()
        ) {

            setOrders([]);

            return undefined;

        }

        let cancelled = false;

        const refresh = async () => {

            if (cancelled) {
                return;
            }

            await refreshUserOrders(false);

        };

        // First load immediately
        refresh();

        // Then every 5 seconds
        const trackingTimer =
            setInterval(
                refresh,
                5000
            );

        return () => {

            cancelled = true;

            clearInterval(
                trackingTimer
            );

        };

    }, [
        currentUser,
        refreshUserOrders
    ]);

    // =========================================================
    // URL PRODUCT VIEW
    // =========================================================

    useEffect(() => {

        const params =
            new URLSearchParams(
                window.location.search
            );

        if (
            params.get('view') ===
            'product'
        ) {

            const productId =
                params.get('id');

            if (productId) {

                const found =
                    allProducts.find(
                        product =>
                            String(product.id) ===
                            String(productId)
                    );

                if (found) {

                    setSelectedProduct(
                        found
                    );

                }

            } else if (
                allProducts.length > 0
            ) {

                setSelectedProduct(
                    allProducts[0]
                );

            }

        }

    }, [allProducts]);

    // =========================================================
    // HELPERS
    // =========================================================

    const toggleTheme = () => {

        setTheme(
            previous =>
                previous === 'dark'
                    ? 'light'
                    : 'dark'
        );

    };

    const showToast = message => {
        setToastMessage(message);
    };

    // =========================================================
    // ⭐ USER LOGIN
    // =========================================================

    const handleUserLogin = async (
        userProfile
    ) => {

        setCurrentUser(
            userProfile
        );

        // Clear old user's orders immediately
        setOrders([]);

        showToast(
            `Welcome back, ${userProfile.name}! 👋`
        );

        // Get fresh orders from MongoDB
        try {

            const latestOrders =
                await api.getMyOrders();

            setOrders(
                Array.isArray(
                    latestOrders
                )
                    ? latestOrders
                    : []
            );

        } catch (error) {

            console.warn(
                'Failed to load customer orders:',
                error.message
            );

        }

    };

    // =========================================================
    // ADD TO CART
    // =========================================================

    const handleAddToCart = product => {

        const size =
            product.selectedSize ||
            (
                product.sizes
                    ? product.sizes[0]
                    : 'Standard'
            );

        const color =
            product.selectedColor ||
            (
                product.colors
                    ? product.colors[0]?.name
                    : ''
            );

        const qty =
            product.quantity || 1;

        setCartItems(previous => {

            const existingIndex =
                previous.findIndex(
                    item =>
                        item.id ===
                            product.id &&
                        item.selectedSize ===
                            size &&
                        item.selectedColor ===
                            color
                );

            if (
                existingIndex > -1
            ) {

                const updated =
                    [...previous];

                updated[
                    existingIndex
                ].quantity =
                    (
                        updated[
                            existingIndex
                        ].quantity || 1
                    ) + qty;

                return updated;

            }

            return [
                ...previous,
                {
                    ...product,
                    selectedSize:
                        size,
                    selectedColor:
                        color,
                    quantity:
                        qty
                }
            ];

        });

        showToast(
            `${product.n} added to cart! 🛍️`
        );

    };

    // =========================================================
    // UPDATE QUANTITY
    // =========================================================

    const handleUpdateQuantity = (
        itemToUpdate,
        newQty
    ) => {

        if (newQty <= 0) {

            handleRemoveFromCart(
                itemToUpdate
            );

            return;

        }

        setCartItems(
            previous =>
                previous.map(
                    item => {

                        if (
                            item.id ===
                                itemToUpdate.id &&
                            item.selectedSize ===
                                itemToUpdate.selectedSize &&
                            item.selectedColor ===
                                itemToUpdate.selectedColor
                        ) {

                            return {
                                ...item,
                                quantity:
                                    newQty
                            };

                        }

                        return item;

                    }
                )
        );

    };

    // =========================================================
    // REMOVE CART
    // =========================================================

    const handleRemoveFromCart = (
        itemToRemove
    ) => {

        setCartItems(
            previous =>
                previous.filter(
                    item =>
                        !(
                            item.id ===
                                itemToRemove.id &&
                            item.selectedSize ===
                                itemToRemove.selectedSize &&
                            item.selectedColor ===
                                itemToRemove.selectedColor
                        )
                )
        );

        showToast(
            'Removed from cart'
        );

    };

    // =========================================================
    // WISHLIST
    // =========================================================

    const handleToggleWishlist = (
        product
    ) => {

        const isSaved =
            wishlistItems.some(
                item =>
                    item.id ===
                    product.id
            );

        if (isSaved) {

            setWishlistItems(
                previous =>
                    previous.filter(
                        item =>
                            item.id !==
                            product.id
                    )
            );

            showToast(
                `Removed ${product.n} from wishlist`
            );

        } else {

            setWishlistItems(
                previous => [
                    ...previous,
                    product
                ]
            );

            showToast(
                `Saved ${product.n} to wishlist! ❤️`
            );

        }

    };

    // =========================================================
    // MOVE WISHLIST TO CART
    // =========================================================

    const handleMoveWishlistToCart = (
        product
    ) => {

        handleAddToCart(
            product
        );

        setWishlistItems(
            previous =>
                previous.filter(
                    item =>
                        item.id !==
                        product.id
                )
        );

    };

    // =========================================================
    // ⭐ PLACE ORDER
    // =========================================================

    const handleOrderPlaced = async (
        orderData
    ) => {

        try {

            const created =
                await api.createOrder({
                    customer:
                        orderData.customer,

                    items:
                        [...cartItems],

                    totals:
                        checkoutTotals,

                    paymentMethod:
                        'UPI (GPay / PhonePe)',

                    paymentVerifiedBySeller:
                        false
                });

            // Immediately show newly-created order
            setOrders(
                previous => [
                    created,
                    ...previous.filter(
                        order =>
                            order.id !==
                            created.id
                    )
                ]
            );

            setCartItems([]);

            showToast(
                `Payment submitted. Order ${created.id} is waiting for seller verification.`
            );

            return created;

        } catch (error) {

            showToast(
                error.message
            );

            throw error;

        }

    };

    // =========================================================
    // FILTER PRODUCTS
    // =========================================================

    const filteredProducts =
        allProducts.filter(
            item => {

                const matchesCategory =
                    activeCategory ===
                        'All' ||
                    item.c ===
                        activeCategory;

                const matchesAge =
                    activeAge ===
                        'All Ages' ||
                    (
                        item.a &&
                        item.a.includes(
                            activeAge.replace(
                                'Age: ',
                                ''
                            )
                        )
                    );

                const search =
                    searchQuery
                        .toLowerCase()
                        .trim();

                const matchesSearch =
                    search === '' ||
                    (
                        item.n &&
                        item.n
                            .toLowerCase()
                            .includes(search)
                    ) ||
                    (
                        item.c &&
                        item.c
                            .toLowerCase()
                            .includes(search)
                    ) ||
                    (
                        item.fabric &&
                        item.fabric
                            .toLowerCase()
                            .includes(search)
                    );

                return (
                    matchesCategory &&
                    matchesAge &&
                    matchesSearch
                );

            }
        );

    // =========================================================
    // SORT
    // =========================================================

    const sortedProducts =
        [...filteredProducts].sort(
            (a, b) => {

                if (
                    sortOption === 'l'
                ) {

                    return (
                        Number(a.p || 0) -
                        Number(b.p || 0)
                    );

                }

                if (
                    sortOption === 'h'
                ) {

                    return (
                        Number(b.p || 0) -
                        Number(a.p || 0)
                    );

                }

                if (
                    sortOption === 'r'
                ) {

                    return (
                        Number(
                            b.rating || 0
                        ) -
                        Number(
                            a.rating || 0
                        )
                    );

                }

                return 0;

            }
        );

    // =========================================================
    // COUNTS
    // =========================================================

    const cartTotalCount =
        cartItems.reduce(
            (
                total,
                item
            ) =>
                total +
                (
                    item.quantity ||
                    1
                ),
            0
        );

    // =========================================================
    // OPEN MY ORDERS
    // =========================================================

    const handleOpenUserOrders =
        async () => {

            // Open immediately
            setIsUserOrdersOpen(
                true
            );

            // Then force fresh MongoDB fetch
            if (
                currentUser &&
                getAuthToken()
            ) {

                await refreshUserOrders(
                    true
                );

            }

        };

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div
            style={{
                minHeight:
                    '100vh',

                display:
                    'flex',

                flexDirection:
                    'column'
            }}
        >

            <PromoBanner />

            {/* =====================================================
                HEADER
            ===================================================== */}

            <Header

                cartCount={
                    cartTotalCount
                }

                wishlistCount={
                    wishlistItems.length
                }

                theme={
                    theme
                }

                toggleTheme={
                    toggleTheme
                }

                onOpenCart={() =>
                    setIsCartOpen(true)
                }

                onOpenWishlist={() =>
                    setIsWishlistOpen(true)
                }

                activeCategory={
                    activeCategory
                }

                setActiveCategory={
                    setActiveCategory
                }

                searchQuery={
                    searchQuery
                }

                setSearchQuery={
                    setSearchQuery
                }

                setViewMode={
                    setViewMode
                }

                currentUser={
                    currentUser
                }

                onOpenAuth={() => {

                    setAuthInitialTab(
                        'user'
                    );

                    setIsAuthOpen(
                        true
                    );

                }}

                onOpenUserOrders={
                    handleOpenUserOrders
                }

            />

            {/* =====================================================
                MAIN
            ===================================================== */}

            <main
                style={{
                    maxWidth:
                        '1140px',

                    width:
                        '100%',

                    margin:
                        '0 auto',

                    padding:
                        '24px 16px 48px',

                    flex:
                        1
                }}
            >

                <Hero

                    activeCategory={
                        activeCategory
                    }

                    setActiveCategory={
                        setActiveCategory
                    }

                />

                <div
                    className="top"
                    style={{
                        marginTop:
                            '28px'
                    }}
                >

                    <h1
                        style={{
                            fontSize:
                                'clamp(1.8rem, 5vw, 2.6rem)',

                            color:
                                'var(--ink)',

                            fontFamily:
                                'Cinzel, serif'
                        }}
                    >
                        Shop All Collections
                    </h1>

                    <p
                        style={{
                            color:
                                'var(--mute)',

                            margin:
                                '4px 0 20px',

                            fontSize:
                                '1.05rem',

                            fontWeight:
                                600
                        }}
                    >
                        Premium, comfortable
                        styles for your little
                        ones —{' '}

                        <em>
                            Styles that defines
                            you ..
                        </em>
                    </p>

                </div>

                <FilterTools

                    activeCategory={
                        activeCategory
                    }

                    setActiveCategory={
                        setActiveCategory
                    }

                    activeAge={
                        activeAge
                    }

                    setActiveAge={
                        setActiveAge
                    }

                    sortOption={
                        sortOption
                    }

                    setSortOption={
                        setSortOption
                    }

                    totalResults={
                        sortedProducts.length
                    }

                />

                {/* =================================================
                    PRODUCTS
                ================================================= */}

                <div
                    className="grid"
                    id="grid"
                >

                    {
                        sortedProducts.length >
                        0
                            ? (
                                sortedProducts.map(
                                    product => (

                                        <ProductCard

                                            key={
                                                product.id
                                            }

                                            product={
                                                product
                                            }

                                            onAddToCart={
                                                handleAddToCart
                                            }

                                            onQuickView={
                                                product =>
                                                    setSelectedProduct(
                                                        product
                                                    )
                                            }

                                            isWishlisted={
                                                wishlistItems.some(
                                                    item =>
                                                        item.id ===
                                                        product.id
                                                )
                                            }

                                            onToggleWishlist={
                                                handleToggleWishlist
                                            }

                                        />

                                    )
                                )
                            )
                            : (

                                <p
                                    className="empty"
                                    style={{
                                        gridColumn:
                                            '1 / -1',

                                        color:
                                            'var(--mute)',

                                        textAlign:
                                            'center',

                                        padding:
                                            '40px 0',

                                        fontSize:
                                            '1.1rem'
                                    }}
                                >
                                    No products found
                                    in this category
                                    or search query.
                                    Try clearing your
                                    filters!
                                </p>

                            )
                    }

                </div>

            </main>

            <Footer />

            {/* =====================================================
                PRODUCT MODAL
            ===================================================== */}

            {
                selectedProduct && (

                    <ProductDetailModal

                        product={
                            selectedProduct
                        }

                        onClose={() =>
                            setSelectedProduct(
                                null
                            )
                        }

                        onAddToCart={
                            handleAddToCart
                        }

                        isWishlisted={
                            wishlistItems.some(
                                item =>
                                    item.id ===
                                    selectedProduct.id
                            )
                        }

                        onToggleWishlist={
                            handleToggleWishlist
                        }

                    />

                )
            }

            {/* =====================================================
                CART
            ===================================================== */}

            <CartDrawer

                isOpen={
                    isCartOpen
                }

                onClose={() =>
                    setIsCartOpen(false)
                }

                cartItems={
                    cartItems
                }

                onUpdateQuantity={
                    handleUpdateQuantity
                }

                onRemoveItem={
                    handleRemoveFromCart
                }

                onProceedCheckout={
                    totals => {

                        setCheckoutTotals(
                            totals
                        );

                        setIsCheckoutOpen(
                            true
                        );

                    }
                }

            />

            {/* =====================================================
                WISHLIST
            ===================================================== */}

            <WishlistDrawer

                isOpen={
                    isWishlistOpen
                }

                onClose={() =>
                    setIsWishlistOpen(false)
                }

                wishlistItems={
                    wishlistItems
                }

                onMoveToCart={
                    handleMoveWishlistToCart
                }

                onRemoveWishlist={
                    handleToggleWishlist
                }

            />

            {/* =====================================================
                AUTH
            ===================================================== */}

            <AuthModal

                isOpen={
                    isAuthOpen
                }

                onClose={() =>
                    setIsAuthOpen(false)
                }

                initialTab={
                    authInitialTab
                }

                onUserLogin={
                    handleUserLogin
                }

            />

            {/* =====================================================
                ⭐ USER ORDERS / TRACKING
            ===================================================== */}

            <UserOrdersModal

                isOpen={
                    isUserOrdersOpen
                }

                onClose={() =>
                    setIsUserOrdersOpen(
                        false
                    )
                }

                currentUser={
                    currentUser
                }

                allOrders={
                    orders
                }

                onViewInvoice={
                    order =>
                        setInvoiceOrder(
                            order
                        )
                }

            />

            {/* =====================================================
                CHECKOUT
            ===================================================== */}

            <CheckoutModal

                isOpen={
                    isCheckoutOpen
                }

                onClose={() =>
                    setIsCheckoutOpen(
                        false
                    )
                }

                cartItems={
                    cartItems
                }

                totals={
                    checkoutTotals
                }

                onClearCart={() =>
                    setCartItems([])
                }

                onOrderCreated={
                    handleOrderPlaced
                }

            />

            {/* =====================================================
                INVOICE
            ===================================================== */}

            {
                invoiceOrder && (

                    <InvoiceModal

                        order={
                            invoiceOrder
                        }

                        onClose={() =>
                            setInvoiceOrder(
                                null
                            )
                        }

                    />

                )
            }

            {/* =====================================================
                TOAST
            ===================================================== */}

            <Toast

                message={
                    toastMessage
                }

                onClose={() =>
                    setToastMessage('')
                }

            />

        </div>

    );

}


// =============================================================
// INVOICE MODAL
// =============================================================

function InvoiceModal({
    order,
    onClose
}) {

    if (!order) {
        return null;
    }

    const invoiceNumber =
        order.invoiceNumber ||
        `INV-${String(order.id).replace(
            /[^a-zA-Z0-9]/g,
            ''
        )}`;

    const customer =
        order.customer || {};

    const items =
        order.items || [];

    const totals =
        order.totals || {};

    const printInvoice = () => {
        window.print();
    };

    return (

        <div
            style={{
                position:
                    'fixed',

                inset:
                    0,

                zIndex:
                    200,

                background:
                    'rgba(0,0,0,0.75)',

                backdropFilter:
                    'blur(6px)',

                display:
                    'flex',

                alignItems:
                    'center',

                justifyContent:
                    'center',

                padding:
                    '16px'
            }}
        >

            <div
                id="invoice-print"
                style={{
                    width:
                        '100%',

                    maxWidth:
                        '720px',

                    maxHeight:
                        '90vh',

                    overflowY:
                        'auto',

                    background:
                        '#fff',

                    color:
                        '#111',

                    borderRadius:
                        '14px',

                    padding:
                        '30px',

                    boxShadow:
                        '0 20px 60px rgba(0,0,0,.3)'
                }}
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    style={{
                        display:
                            'flex',

                        justifyContent:
                            'space-between',

                        alignItems:
                            'flex-start',

                        borderBottom:
                            '2px solid #111',

                        paddingBottom:
                            '18px',

                        marginBottom:
                            '20px'
                    }}
                >

                    <div>

                        <h1
                            style={{
                                margin:
                                    0,

                                fontSize:
                                    '28px',

                                fontWeight:
                                    900
                            }}
                        >
                            JP CLOTHING
                        </h1>

                        <p
                            style={{
                                margin:
                                    '5px 0 0',

                                color:
                                    '#666'
                            }}
                        >
                            JP Clothings
                        </p>

                    </div>

                    <div
                        style={{
                            textAlign:
                                'right'
                        }}
                    >

                        <h2
                            style={{
                                margin:
                                    0
                            }}
                        >
                            INVOICE
                        </h2>

                        <div
                            style={{
                                marginTop:
                                    '5px',

                                fontWeight:
                                    700
                            }}
                        >
                            {invoiceNumber}
                        </div>

                    </div>

                </div>

                {/* =================================================
                    CUSTOMER
                ================================================= */}

                <div
                    style={{
                        display:
                            'grid',

                        gridTemplateColumns:
                            '1fr 1fr',

                        gap:
                            '20px',

                        marginBottom:
                            '25px'
                    }}
                >

                    <div>

                        <strong>
                            Bill To
                        </strong>

                        <p
                            style={{
                                margin:
                                    '6px 0',

                                lineHeight:
                                    1.6
                            }}
                        >

                            {
                                customer.name ||
                                'Customer'
                            }

                            <br />

                            {
                                customer.phone ||
                                customer.email ||
                                ''
                            }

                            {
                                customer.address && (
                                    <>
                                        <br />
                                        {
                                            customer.address
                                        }
                                    </>
                                )
                            }

                        </p>

                    </div>

                    <div
                        style={{
                            textAlign:
                                'right'
                        }}
                    >

                        <strong>
                            Order Details
                        </strong>

                        <p
                            style={{
                                margin:
                                    '6px 0',

                                lineHeight:
                                    1.6
                            }}
                        >

                            Order ID:{' '}

                            <strong>
                                {order.id}
                            </strong>

                            <br />

                            Date:{' '}

                            {
                                order.createdAt
                                    ? new Date(
                                          order.createdAt
                                      ).toLocaleDateString(
                                          'en-IN'
                                      )
                                    : new Date().toLocaleDateString(
                                          'en-IN'
                                      )
                            }

                            <br />

                            Status:{' '}

                            <strong>
                                {
                                    order.status ||
                                    'Approved'
                                }
                            </strong>

                        </p>

                    </div>

                </div>

                {/* =================================================
                    ITEMS
                ================================================= */}

                <table
                    style={{
                        width:
                            '100%',

                        borderCollapse:
                            'collapse',

                        marginBottom:
                            '20px'
                    }}
                >

                    <thead>

                        <tr>

                            <th
                                style={{
                                    textAlign:
                                        'left',

                                    borderBottom:
                                        '1px solid #ccc',

                                    padding:
                                        '10px 5px'
                                }}
                            >
                                Item
                            </th>

                            <th
                                style={{
                                    textAlign:
                                        'center',

                                    borderBottom:
                                        '1px solid #ccc',

                                    padding:
                                        '10px 5px'
                                }}
                            >
                                Qty
                            </th>

                            <th
                                style={{
                                    textAlign:
                                        'right',

                                    borderBottom:
                                        '1px solid #ccc',

                                    padding:
                                        '10px 5px'
                                }}
                            >
                                Price
                            </th>

                            <th
                                style={{
                                    textAlign:
                                        'right',

                                    borderBottom:
                                        '1px solid #ccc',

                                    padding:
                                        '10px 5px'
                                }}
                            >
                                Total
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            items.map(
                                (
                                    item,
                                    index
                                ) => {

                                    const qty =
                                        item.quantity ||
                                        1;

                                    const price =
                                        Number(
                                            item.p
                                        ) || 0;

                                    return (

                                        <tr
                                            key={
                                                index
                                            }
                                        >

                                            <td
                                                style={{
                                                    padding:
                                                        '10px 5px',

                                                    borderBottom:
                                                        '1px solid #eee'
                                                }}
                                            >

                                                {item.n}

                                                {
                                                    item.selectedSize && (

                                                        <small
                                                            style={{
                                                                display:
                                                                    'block',

                                                                color:
                                                                    '#777'
                                                            }}
                                                        >
                                                            Size:{' '}
                                                            {
                                                                item.selectedSize
                                                            }
                                                        </small>

                                                    )
                                                }

                                            </td>

                                            <td
                                                style={{
                                                    textAlign:
                                                        'center',

                                                    padding:
                                                        '10px 5px',

                                                    borderBottom:
                                                        '1px solid #eee'
                                                }}
                                            >
                                                {qty}
                                            </td>

                                            <td
                                                style={{
                                                    textAlign:
                                                        'right',

                                                    padding:
                                                        '10px 5px',

                                                    borderBottom:
                                                        '1px solid #eee'
                                                }}
                                            >
                                                ₹
                                                {price}
                                            </td>

                                            <td
                                                style={{
                                                    textAlign:
                                                        'right',

                                                    padding:
                                                        '10px 5px',

                                                    borderBottom:
                                                        '1px solid #eee',

                                                    fontWeight:
                                                        700
                                                }}
                                            >
                                                ₹
                                                {
                                                    price *
                                                    qty
                                                }
                                            </td>

                                        </tr>

                                    );

                                }
                            )
                        }

                    </tbody>

                </table>

                {/* =================================================
                    TOTALS
                ================================================= */}

                <div
                    style={{
                        marginLeft:
                            'auto',

                        maxWidth:
                            '320px'
                    }}
                >

                    {
                        totals.subtotal != null && (

                            <div
                                style={{
                                    display:
                                        'flex',

                                    justifyContent:
                                        'space-between',

                                    padding:
                                        '5px 0'
                                }}
                            >

                                <span>
                                    Subtotal
                                </span>

                                <strong>
                                    ₹
                                    {
                                        totals.subtotal
                                    }
                                </strong>

                            </div>

                        )
                    }

                    {
                        totals.discount != null && (

                            <div
                                style={{
                                    display:
                                        'flex',

                                    justifyContent:
                                        'space-between',

                                    padding:
                                        '5px 0'
                                }}
                            >

                                <span>
                                    Discount
                                </span>

                                <strong>
                                    -₹
                                    {
                                        totals.discount
                                    }
                                </strong>

                            </div>

                        )
                    }

                    {
                        totals.shipping != null && (

                            <div
                                style={{
                                    display:
                                        'flex',

                                    justifyContent:
                                        'space-between',

                                    padding:
                                        '5px 0'
                                }}
                            >

                                <span>
                                    Shipping
                                </span>

                                <strong>
                                    ₹
                                    {
                                        totals.shipping
                                    }
                                </strong>

                            </div>

                        )
                    }

                    <div
                        style={{
                            display:
                                'flex',

                            justifyContent:
                                'space-between',

                            padding:
                                '12px 0',

                            marginTop:
                                '8px',

                            borderTop:
                                '2px solid #111',

                            fontSize:
                                '1.15rem'
                        }}
                    >

                        <strong>
                            Grand Total
                        </strong>

                        <strong>

                            ₹
                            {
                                totals.grandTotal ??
                                items.reduce(
                                    (
                                        sum,
                                        item
                                    ) =>
                                        sum +
                                        (
                                            Number(
                                                item.p
                                            ) || 0
                                        ) *
                                        (
                                            item.quantity ||
                                            1
                                        ),
                                    0
                                )
                            }

                        </strong>

                    </div>

                </div>

                {/* =================================================
                    PAYMENT
                ================================================= */}

                <div
                    style={{
                        marginTop:
                            '20px',

                        padding:
                            '12px',

                        background:
                            '#f5f5f5',

                        borderRadius:
                            '8px'
                    }}
                >

                    Payment Method:{' '}

                    <strong>
                        {
                            order.paymentMethod ||
                            'WhatsApp / COD'
                        }
                    </strong>

                </div>

                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                    style={{
                        textAlign:
                            'center',

                        marginTop:
                            '25px',

                        color:
                            '#666',

                        fontSize:
                            '0.85rem'
                    }}
                >
                    Thank you for shopping
                    with JP Clothing ❤️
                </div>

                {/* =================================================
                    BUTTONS
                ================================================= */}

                <div
                    className="invoice-actions"
                    style={{
                        display:
                            'flex',

                        gap:
                            '10px',

                        justifyContent:
                            'center',

                        marginTop:
                            '25px'
                    }}
                >

                    <button
                        onClick={
                            printInvoice
                        }
                        style={{
                            border:
                                'none',

                            background:
                                '#111',

                            color:
                                '#fff',

                            padding:
                                '11px 22px',

                            borderRadius:
                                '8px',

                            cursor:
                                'pointer',

                            fontWeight:
                                700
                        }}
                    >
                        🖨️ Print Invoice
                    </button>

                    <button
                        onClick={
                            onClose
                        }
                        style={{
                            border:
                                '1px solid #ccc',

                            background:
                                '#fff',

                            color:
                                '#111',

                            padding:
                                '11px 22px',

                            borderRadius:
                                '8px',

                            cursor:
                                'pointer',

                            fontWeight:
                                700
                        }}
                    >
                        Close
                    </button>

                </div>

            </div>

        </div>

    );

}