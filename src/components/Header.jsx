import React from 'react';
import { clearUserSession } from '../lib/api';
import {
    ShoppingBag,
    Heart,
    Sun,
    Moon,
    Search,
    User,
    Package,
    LogOut
} from 'lucide-react';

export default function Header({
    cartCount,
    wishlistCount,
    theme,
    toggleTheme,
    onOpenCart,
    onOpenWishlist,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    setViewMode,
    currentUser,
    onOpenAuth,
    onOpenUserOrders,
}) {

    // Logout function
    const handleLogout = () => {
        clearUserSession();
        window.location.reload();
    };

    return (
        <header
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 40
            }}
            className="glass-panel"
        >
            <div
                style={{
                    maxWidth: '1140px',
                    margin: '0 auto',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px'
                }}
            >

                {/* Logo with official emblem from image */}
                <div
                    onClick={() => {
                        setActiveCategory('All');
                        setViewMode('grid');
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer'
                    }}
                >
                    <div
                        style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid var(--brand)',
                            boxShadow: 'var(--gold-glow)',
                            background: '#180205',
                            flexShrink: 0
                        }}
                    >
                        <img
                            src="/images/jp_logo.jpeg"
                            alt="JP Clothing Logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                        />
                    </div>

                    <div>
                        <span
                            style={{
                                fontSize: '1.45rem',
                                fontFamily: 'Cinzel, serif',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                lineHeight: 1,
                                display: 'block'
                            }}
                            className="brand-text"
                        >
                            JP CLOTHING
                        </span>

                        <span
                            style={{
                                display: 'block',
                                fontSize: '0.66rem',
                                color: 'var(--mute)',
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                                fontStyle: 'italic',
                                marginTop: '2px'
                            }}
                        >
                            Styles that defines you ..
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav
                    style={{
                        display: 'flex',
                        gap: '16px',
                        fontWeight: 700,
                        marginLeft: '12px'
                    }}
                    className="nav-links"
                >
                    {['All', 'Girls', 'Boys', 'Infants'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(cat);
                                setViewMode('grid');
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color:
                                    activeCategory === cat
                                        ? 'var(--brand)'
                                        : 'var(--ink)',
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                fontFamily: 'Nunito, sans-serif',
                                fontWeight:
                                    activeCategory === cat ? 800 : 700,
                                position: 'relative',
                                padding: '4px 0'
                            }}
                        >
                            {cat === 'All' ? 'Shop All' : cat}

                            {activeCategory === cat && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '3px',
                                        backgroundColor: 'var(--brand)',
                                        borderRadius: '99px'
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Search input in header */}
                <div
                    style={{
                        marginLeft: 'auto',
                        position: 'relative',
                        width: '180px'
                    }}
                    className="search-box"
                >
                    <Search
                        size={15}
                        style={{
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--mute)'
                        }}
                    />

                    <input
                        type="text"
                        placeholder="Search dresses..."
                        value={searchQuery}
                        onChange={(e) =>
                            setSearchQuery(e.target.value)
                        }
                        style={{
                            width: '100%',
                            padding: '6px 10px 6px 30px',
                            borderRadius: '999px',
                            border: '1px solid var(--line)',
                            background: 'var(--card)',
                            color: 'var(--ink)',
                            fontSize: '0.86rem',
                            fontFamily: 'Nunito, sans-serif'
                        }}
                    />

                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: 'var(--mute)',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* User Account / Login / Logout */}
                {currentUser ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >

                        {/* My Orders */}
                        <button
                            onClick={onOpenUserOrders}
                            className="chip"
                            style={{
                                padding: '6px 12px',
                                fontSize: '0.82rem',
                                borderColor: 'var(--brand)',
                                color: 'var(--brand)'
                            }}
                            title="View My Orders"
                        >
                            <Package size={15} />
                            My Orders
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="chip"
                            style={{
                                padding: '6px 12px',
                                fontSize: '0.82rem',
                                borderColor: 'var(--accent)',
                                color: 'var(--accent)'
                            }}
                            title="Logout"
                        >
                            <LogOut size={15} />
                            Logout
                        </button>

                    </div>
                ) : (
                    /* Login / Signup */
                    <button
                        onClick={onOpenAuth}
                        className="chip"
                        style={{
                            padding: '6px 14px',
                            fontSize: '0.86rem'
                        }}
                    >
                        <User size={15} />
                        Login / Signup
                    </button>
                )}

                {/* Wishlist Icon */}
                <button
                    onClick={onOpenWishlist}
                    className="btn-icon"
                    style={{
                        position: 'relative'
                    }}
                    title="View Wishlist"
                    aria-label="Wishlist"
                >
                    <Heart
                        size={18}
                        color={
                            wishlistCount > 0
                                ? 'var(--brand)'
                                : 'var(--ink)'
                        }
                        fill={
                            wishlistCount > 0
                                ? 'var(--brand)'
                                : 'none'
                        }
                    />

                    {wishlistCount > 0 && (
                        <span
                            style={{
                                position: 'absolute',
                                top: '-4px',
                                right: '-4px',
                                background: 'var(--brand)',
                                color: 'var(--brand-ink)',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {wishlistCount}
                        </span>
                    )}
                </button>

                {/* Cart Button */}
                <button
                    onClick={onOpenCart}
                    className="btn-primary"
                    id="cart"
                    aria-label="Cart"
                    style={{
                        padding: '7px 16px',
                        fontSize: '0.92rem'
                    }}
                >
                    <ShoppingBag size={17} />

                    <span>
                        Cart (
                        <span id="n">
                            {cartCount}
                        </span>
                        )
                    </span>
                </button>

            </div>

            <style>{`
                @media (max-width: 820px) {
                    .nav-links {
                        display: none !important;
                    }

                    .search-box {
                        width: 130px !important;
                    }
                }
            `}</style>

        </header>
    );
}