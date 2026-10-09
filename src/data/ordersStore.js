// LocalStorage Order Persistence for JP CLOTHING
const ORDERS_STORAGE_KEY = 'jp_clothing_all_orders';

export const initialMockOrders = [
    {
        id: 'JP-849201',
        customer: {
            name: 'Kavitha Ram',
            phone: '9344634124',
            email: 'kavitha@example.com',
            address: '14, Golden Avenue, Adyar',
            city: 'Chennai',
            pincode: '600020'
        },
        items: [
            { id: 1, n: 'Royal Gold Silk Lehenga Choli', p: 1899, selectedSize: '3-4Y', quantity: 1 },
            { id: 2, n: 'Floral Cotton Summer Frock', p: 799, selectedSize: '2-3Y', quantity: 1 }
        ],
        totals: { grandTotal: 2698 },
        paymentMethod: 'UPI (GPay)',
        status: 'Processing',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        isRead: false
    },
    {
        id: 'JP-731940',
        customer: {
            name: 'Arun Prakash',
            phone: '9840123456',
            email: 'arun@example.com',
            address: '5, Heritage Colony',
            city: 'Coimbatore',
            pincode: '641001'
        },
        items: [
            { id: 3, n: 'Ethniq Silk Kurta & Dhoti Set', p: 1299, selectedSize: '4-5Y', quantity: 1 }
        ],
        totals: { grandTotal: 1299 },
        paymentMethod: 'Cash on Delivery',
        status: 'Shipped',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        isRead: true
    }
];

export function getStoredOrders() {
    try {
        const data = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (!data) {
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(initialMockOrders));
            return initialMockOrders;
        }
        return JSON.parse(data);
    } catch (e) {
        console.error("Failed to parse orders from localStorage", e);
        return initialMockOrders;
    }
}

export function saveOrdersToStorage(orders) {
    try {
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
        console.error("Failed to save orders to localStorage", e);
    }
}
