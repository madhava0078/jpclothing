import React from 'react';
import {
    X,
    Package,
    Clock,
    CheckCircle2,
    Truck,
    AlertCircle
} from 'lucide-react';

export default function UserOrdersModal({
    isOpen,
    onClose,
    currentUser,
    allOrders,
    onViewInvoice
}) {

    if (!isOpen) {
        return null;
    }

    // =========================================================
    // USER ORDERS
    // =========================================================
    // IMPORTANT:
    // api.getMyOrders() already returns only the logged-in
    // customer's orders.
    //
    // DO NOT filter again using name / phone / email here.
    // =========================================================

    const userOrders = Array.isArray(allOrders)
        ? allOrders
        : [];

    // =========================================================
    // STATUS BADGE
    // =========================================================

    const getStatusBadge = (status) => {

        switch (status) {

            case 'Delivered':
                return {
                    bg: '#dcfce7',
                    color: '#15803d',
                    icon: CheckCircle2
                };

            case 'Shipped':
                return {
                    bg: '#dbeafe',
                    color: '#1d4ed8',
                    icon: Truck
                };

            case 'Processing':
                return {
                    bg: '#fef3c7',
                    color: '#b45309',
                    icon: Package
                };

            case 'Approved':
                return {
                    bg: '#ede9fe',
                    color: '#6d28d9',
                    icon: CheckCircle2
                };

            case 'Pending':
                return {
                    bg: '#fee2e2',
                    color: '#b91c1c',
                    icon: Clock
                };

            default:
                return {
                    bg: '#f3f4f6',
                    color: '#374151',
                    icon: AlertCircle
                };
        }
    };

    // =========================================================
    // TRACKING STEPS
    // =========================================================

    const trackingSteps = [
        {
            key: 'Pending',
            label: 'Order Placed',
            description:
                'Your order has been received'
        },
        {
            key: 'Approved',
            label: 'Approved',
            description:
                'Your order has been approved'
        },
        {
            key: 'Processing',
            label: 'Packed',
            description:
                'Your order is being prepared'
        },
        {
            key: 'Shipped',
            label: 'Shipped',
            description:
                'Your order has been shipped'
        },
        {
            key: 'Delivered',
            label: 'Delivered',
            description:
                'Your order has been delivered'
        }
    ];

    // =========================================================
    // STATUS INDEX
    // =========================================================

    const getStatusIndex = (status) => {

        const index =
            trackingSteps.findIndex(
                step =>
                    step.key === status
            );

        return index === -1
            ? 0
            : index;
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 80,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
            }}
            onClick={onClose}
        >

            <div
                style={{
                    background: 'var(--card)',
                    color: 'var(--ink)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--radius-lg)',
                    maxWidth: '700px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    position: 'relative',
                    padding: '28px',
                    boxShadow: 'var(--shadow-lg)'
                }}
                onClick={e => e.stopPropagation()}
            >

                {/* =================================================
                    CLOSE
                ================================================= */}

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '18px',
                        right: '18px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--ink)'
                    }}
                >
                    <X size={22} />
                </button>

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        marginBottom: '6px'
                    }}
                >

                    <Package
                        size={24}
                        color="var(--brand)"
                    />

                    <h2
                        style={{
                            fontSize: '1.5rem',
                            fontFamily:
                                'Fredoka, sans-serif',
                            color: 'var(--ink)',
                            margin: 0
                        }}
                    >
                        My Orders & Tracking 📦
                    </h2>

                </div>

                <p
                    style={{
                        color: 'var(--mute)',
                        fontSize: '0.88rem',
                        marginBottom: '20px'
                    }}
                >
                    Account:{' '}
                    <strong>
                        {currentUser?.name}
                    </strong>{' '}
                    (
                    {currentUser?.contact}
                    )
                </p>

                {/* =================================================
                    NO ORDERS
                ================================================= */}

                {userOrders.length === 0 ? (

                    <div
                        style={{
                            textAlign: 'center',
                            padding: '50px 20px',
                            color: 'var(--mute)'
                        }}
                    >

                        <Package
                            size={48}
                            style={{
                                opacity: 0.3,
                                marginBottom: '12px'
                            }}
                        />

                        <h3
                            style={{
                                fontSize: '1.1rem',
                                color: 'var(--ink)'
                            }}
                        >
                            No orders placed yet
                        </h3>

                        <p
                            style={{
                                fontSize: '0.86rem',
                                marginTop: '4px'
                            }}
                        >
                            When you place an order,
                            live tracking details
                            will appear here!
                        </p>

                    </div>

                ) : (

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}
                    >

                        {userOrders.map(order => {

                            const statusInfo =
                                getStatusBadge(
                                    order.status
                                );

                            const StatusIcon =
                                statusInfo.icon;

                            const currentStatusIndex =
                                getStatusIndex(
                                    order.status ||
                                    'Pending'
                                );

                            return (

                                <div
                                    key={order.id}
                                    style={{
                                        border:
                                            '1px solid var(--line)',
                                        borderRadius:
                                            'var(--radius-md)',
                                        background:
                                            'var(--bg)',
                                        padding: '16px',
                                        display: 'flex',
                                        flexDirection:
                                            'column',
                                        gap: '12px'
                                    }}
                                >

                                    {/* =================================================
                                        ORDER HEADER
                                    ================================================= */}

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent:
                                                'space-between',
                                            alignItems:
                                                'center',
                                            gap: '10px',
                                            borderBottom:
                                                '1px solid var(--line)',
                                            paddingBottom:
                                                '10px'
                                        }}
                                    >

                                        <div>

                                            <span
                                                style={{
                                                    fontWeight: 800,
                                                    fontSize:
                                                        '0.95rem',
                                                    color:
                                                        'var(--brand)'
                                                }}
                                            >
                                                {order.id}
                                            </span>

                                            <div
                                                style={{
                                                    fontSize:
                                                        '0.76rem',
                                                    color:
                                                        'var(--mute)',
                                                    marginTop:
                                                        '3px'
                                                }}
                                            >
                                                Placed on{' '}

                                                {order.createdAt
                                                    ? new Date(
                                                          order.createdAt
                                                      ).toLocaleDateString(
                                                          'en-IN',
                                                          {
                                                              day:
                                                                  'numeric',
                                                              month:
                                                                  'short',
                                                              year:
                                                                  'numeric',
                                                              hour:
                                                                  '2-digit',
                                                              minute:
                                                                  '2-digit'
                                                          }
                                                      )
                                                    : '-'}
                                            </div>

                                        </div>

                                        {/* STATUS */}

                                        <div
                                            style={{
                                                background:
                                                    statusInfo.bg,
                                                color:
                                                    statusInfo.color,
                                                padding:
                                                    '5px 12px',
                                                borderRadius:
                                                    '999px',
                                                fontSize:
                                                    '0.78rem',
                                                fontWeight: 800,
                                                display:
                                                    'flex',
                                                alignItems:
                                                    'center',
                                                gap: '4px'
                                            }}
                                        >

                                            <StatusIcon
                                                size={14}
                                            />

                                            {order.status ||
                                                'Pending'}

                                        </div>

                                    </div>

                                    {/* =================================================
                                        INVOICE
                                    ================================================= */}

                                    {(
                                        order.status ===
                                            'Approved' ||
                                        order.status ===
                                            'Processing' ||
                                        order.status ===
                                            'Shipped' ||
                                        order.status ===
                                            'Delivered'
                                    ) && (

                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent:
                                                    'space-between',
                                                alignItems:
                                                    'center',
                                                gap: '10px',
                                                padding:
                                                    '10px 12px',
                                                borderRadius:
                                                    '10px',
                                                background:
                                                    'rgba(124,58,237,0.08)',
                                                border:
                                                    '1px solid rgba(124,58,237,0.2)'
                                            }}
                                        >

                                            <div>

                                                <strong>
                                                    Invoice
                                                </strong>

                                                <div
                                                    style={{
                                                        fontSize:
                                                            '0.75rem',
                                                        color:
                                                            'var(--mute)',
                                                        marginTop:
                                                            '2px'
                                                    }}
                                                >
                                                    {
                                                        order.invoiceNumber ||
                                                        `INV-${String(
                                                            order.id
                                                        ).replace(
                                                            /[^a-zA-Z0-9]/g,
                                                            ''
                                                        )}`
                                                    }
                                                </div>

                                            </div>

                                            {onViewInvoice && (

                                                <button
                                                    onClick={() =>
                                                        onViewInvoice(
                                                            order
                                                        )
                                                    }
                                                    style={{
                                                        border:
                                                            'none',
                                                        background:
                                                            'var(--brand)',
                                                        color:
                                                            '#fff',
                                                        padding:
                                                            '8px 14px',
                                                        borderRadius:
                                                            '8px',
                                                        cursor:
                                                            'pointer',
                                                        fontWeight:
                                                            700
                                                    }}
                                                >
                                                    View Invoice
                                                </button>

                                            )}

                                        </div>

                                    )}

                                    {/* =================================================
                                        TRACKING
                                    ================================================= */}

                                    <div
                                        style={{
                                            marginTop: '4px',
                                            padding: '16px',
                                            borderRadius:
                                                '12px',
                                            background:
                                                'var(--card)',
                                            border:
                                                '1px solid var(--line)'
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize:
                                                    '0.92rem',
                                                fontWeight: 800,
                                                marginBottom:
                                                    '16px',
                                                color:
                                                    'var(--ink)'
                                            }}
                                        >
                                            Order Tracking
                                        </div>

                                        <div
                                            style={{
                                                display: 'flex',
                                                flexDirection:
                                                    'column'
                                            }}
                                        >

                                            {trackingSteps.map(
                                                (
                                                    step,
                                                    index
                                                ) => {

                                                    const isCompleted =
                                                        index <=
                                                        currentStatusIndex;

                                                    const isCurrent =
                                                        index ===
                                                        currentStatusIndex;

                                                    const isLast =
                                                        index ===
                                                        trackingSteps.length -
                                                            1;

                                                    return (

                                                        <div
                                                            key={
                                                                step.key
                                                            }
                                                            style={{
                                                                display:
                                                                    'flex',
                                                                minHeight:
                                                                    isLast
                                                                        ? '50px'
                                                                        : '68px'
                                                            }}
                                                        >

                                                            {/* ICON */}

                                                            <div
                                                                style={{
                                                                    width:
                                                                        '34px',
                                                                    display:
                                                                        'flex',
                                                                    flexDirection:
                                                                        'column',
                                                                    alignItems:
                                                                        'center'
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        width:
                                                                            '28px',
                                                                        height:
                                                                            '28px',
                                                                        borderRadius:
                                                                            '50%',
                                                                        display:
                                                                            'flex',
                                                                        alignItems:
                                                                            'center',
                                                                        justifyContent:
                                                                            'center',
                                                                        background:
                                                                            isCompleted
                                                                                ? 'var(--brand)'
                                                                                : 'var(--line)',
                                                                        color:
                                                                            isCompleted
                                                                                ? '#fff'
                                                                                : 'var(--mute)',
                                                                        fontSize:
                                                                            '0.72rem',
                                                                        fontWeight:
                                                                            800,
                                                                        border:
                                                                            isCurrent
                                                                                ? '3px solid rgba(0,0,0,0.08)'
                                                                                : 'none',
                                                                        boxSizing:
                                                                            'border-box'
                                                                    }}
                                                                >

                                                                    {isCompleted ? (

                                                                        <CheckCircle2
                                                                            size={
                                                                                15
                                                                            }
                                                                        />

                                                                    ) : (

                                                                        index +
                                                                        1

                                                                    )}

                                                                </div>

                                                                {!isLast && (

                                                                    <div
                                                                        style={{
                                                                            width:
                                                                                '2px',
                                                                            flex:
                                                                                1,
                                                                            minHeight:
                                                                                '35px',
                                                                            background:
                                                                                index <
                                                                                currentStatusIndex
                                                                                    ? 'var(--brand)'
                                                                                    : 'var(--line)'
                                                                        }}
                                                                    />

                                                                )}

                                                            </div>

                                                            {/* CONTENT */}

                                                            <div
                                                                style={{
                                                                    paddingLeft:
                                                                        '12px',
                                                                    paddingBottom:
                                                                        isLast
                                                                            ? '0'
                                                                            : '14px',
                                                                    flex: 1
                                                                }}
                                                            >

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            '0.86rem',
                                                                        fontWeight:
                                                                            isCurrent
                                                                                ? 800
                                                                                : 700,
                                                                        color:
                                                                            isCompleted
                                                                                ? 'var(--ink)'
                                                                                : 'var(--mute)'
                                                                    }}
                                                                >

                                                                    {
                                                                        step.label
                                                                    }

                                                                    {isCurrent && (

                                                                        <span
                                                                            style={{
                                                                                marginLeft:
                                                                                    '8px',
                                                                                fontSize:
                                                                                    '0.68rem',
                                                                                padding:
                                                                                    '3px 8px',
                                                                                borderRadius:
                                                                                    '999px',
                                                                                background:
                                                                                    statusInfo.bg,
                                                                                color:
                                                                                    statusInfo.color,
                                                                                fontWeight:
                                                                                    800
                                                                            }}
                                                                        >
                                                                            CURRENT
                                                                        </span>

                                                                    )}

                                                                </div>

                                                                <div
                                                                    style={{
                                                                        fontSize:
                                                                            '0.74rem',
                                                                        color:
                                                                            'var(--mute)',
                                                                        marginTop:
                                                                            '3px'
                                                                    }}
                                                                >
                                                                    {
                                                                        step.description
                                                                    }
                                                                </div>

                                                            </div>

                                                        </div>

                                                    );

                                                }
                                            )}

                                        </div>

                                    </div>

                                    {/* =================================================
                                        ITEMS
                                    ================================================= */}

                                    <div
                                        style={{
                                            display: 'flex',
                                            flexDirection:
                                                'column',
                                            gap: '8px'
                                        }}
                                    >

                                        {(order.items || []).map(
                                            (
                                                item,
                                                index
                                            ) => {

                                                const quantity =
                                                    item.quantity ||
                                                    1;

                                                const price =
                                                    Number(
                                                        item.p
                                                    ) || 0;

                                                return (

                                                    <div
                                                        key={
                                                            index
                                                        }
                                                        style={{
                                                            display:
                                                                'flex',
                                                            justifyContent:
                                                                'space-between',
                                                            gap:
                                                                '10px',
                                                            fontSize:
                                                                '0.86rem'
                                                        }}
                                                    >

                                                        <span>

                                                            {item.n}

                                                            {' '}x
                                                            {quantity}

                                                            {item.selectedSize && (

                                                                <span
                                                                    style={{
                                                                        color:
                                                                            'var(--mute)'
                                                                    }}
                                                                >
                                                                    {' '}
                                                                    (
                                                                    {
                                                                        item.selectedSize
                                                                    }
                                                                    )
                                                                </span>

                                                            )}

                                                        </span>

                                                        <span
                                                            style={{
                                                                fontWeight:
                                                                    700
                                                            }}
                                                        >
                                                            ₹
                                                            {
                                                                price *
                                                                quantity
                                                            }
                                                        </span>

                                                    </div>

                                                );

                                            }
                                        )}

                                    </div>

                                    {/* =================================================
                                        TOTAL
                                    ================================================= */}

                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent:
                                                'space-between',
                                            alignItems:
                                                'center',
                                            borderTop:
                                                '1px dashed var(--line)',
                                            paddingTop:
                                                '10px',
                                            fontSize:
                                                '0.88rem'
                                        }}
                                    >

                                        <div
                                            style={{
                                                fontSize:
                                                    '0.78rem',
                                                color:
                                                    'var(--mute)'
                                            }}
                                        >
                                            Payment:{' '}

                                            <strong>
                                                {
                                                    order.paymentMethod ||
                                                    'N/A'
                                                }
                                            </strong>
                                        </div>

                                        <div
                                            style={{
                                                fontWeight:
                                                    800,
                                                color:
                                                    'var(--ink)',
                                                fontSize:
                                                    '1rem'
                                            }}
                                        >
                                            Total: ₹
                                            {
                                                order
                                                    .totals
                                                    ?.grandTotal ??
                                                0
                                            }
                                        </div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                )}

            </div>

        </div>

    );
}