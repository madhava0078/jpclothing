import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PRODUCTS as STATIC_PRODUCTS } from '../src/data/products.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jp_clothing';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'jpadmin').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jp007';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '5mb' }));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contact: { type: String, required: true, unique: true, lowercase: true, trim: true },
  method: { type: String, enum: ['phone', 'email'], required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, unique: true, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  customer: { type: Object, required: true },
  items: { type: Array, required: true },
  totals: { type: Object, required: true },
  paymentMethod: { type: String, required: true },
  paymentVerifiedBySeller: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  invoiceNumber: { type: String, default: null, unique: true, sparse: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.Mixed,
  legacyId: { type: String, default: null },
  source: { type: String, enum: ['builtin', 'custom'], default: 'custom' },
  n: { type: String, required: true },
  c: String,
  a: mongoose.Schema.Types.Mixed,
  p: Number,
  o: Number,
  t: String,
  fabric: String,
  description: String,
  sizes: Array,
  colors: Array,
  image: String,
  stock: {
    type: Number,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be a whole number.'
    }
  },
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const inventorySchema = new mongoose.Schema({
  productKey: { type: String, required: true, unique: true, index: true },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be a whole number.'
    }
  },
  updatedAt: { type: Date, default: Date.now }
});

const deletedProductSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true, index: true },
  deletedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Product = mongoose.model('Product', productSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);
const DeletedProduct = mongoose.model('DeletedProduct', deletedProductSchema);

function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function auth(requiredRole = null) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
      req.auth = jwt.verify(token, JWT_SECRET);

      if (requiredRole && req.auth.role !== requiredRole) {
        return res.status(403).json({ message: 'Admin access required.' });
      }

      next();
    } catch {
      return res.status(401).json({
        message: 'Session expired. Please login again.'
      });
    }
  };
}

function optionalUser(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role === 'user') req.auth = decoded;
    } catch {}
  }

  next();
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    contact: user.contact,
    method: user.method,
    role: user.role,
    createdAt: user.createdAt
  };
}

function validStock(value) {
  return value !== '' &&
    value !== null &&
    value !== undefined &&
    Number.isInteger(Number(value)) &&
    Number(value) >= 0;
}

async function getDeletedIds() {
  const rows = await DeletedProduct.find().select('productId -_id').lean();
  return new Set(rows.map(row => String(row.productId)));
}

async function resolveCatalogProduct(item) {
  const builtInId = String(item?.legacyId ?? item?.id ?? '');
  const builtIn = STATIC_PRODUCTS.find(
    product => String(product.id) === builtInId
  );

  if (builtIn) {
    if (await DeletedProduct.exists({ productId: String(builtIn.id) })) {
      return null;
    }

    const key = `builtin:${String(builtIn.id)}`;
    const inventory = await Inventory.findOne({
      productKey: key
    }).lean();

    return {
      ...builtIn,
      source: 'builtin',
      legacyId: String(builtIn.id),
      stock: inventory?.stock ?? 0,
      inventoryKey: key
    };
  }

  const id = String(item?._id ?? item?.id ?? '');

  if (!mongoose.isValidObjectId(id)) return null;

  const product = await Product.findOne({
    _id: id,
    source: { $ne: 'builtin' }
  }).lean();

  if (!product) return null;

  return {
    ...product,
    source: 'custom',
    inventoryKey: `custom:${String(product._id)}`
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'JP Clothing API' });
});

/* USER SIGNUP */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, contact, method, password } = req.body;

    const cleanName = String(name || '').trim();
    const cleanContact = String(contact || '').trim().toLowerCase();

    if (!cleanName || !cleanContact || !password) {
      return res.status(400).json({
        message: 'Name, contact and password are required.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.'
      });
    }

    if (await User.findOne({ contact: cleanContact })) {
      return res.status(409).json({
        message: 'An account already exists. Please login instead.'
      });
    }

    const passwordHash = await bcrypt.hash(String(password), 12);

    const user = await User.create({
      name: cleanName,
      contact: cleanContact,
      method: method === 'email' ? 'email' : 'phone',
      passwordHash
    });

    res.status(201).json({
      token: createToken({
        id: user._id.toString(),
        role: 'user',
        contact: user.contact
      }),
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to create account.',
      error: error.message
    });
  }
});

/* USER LOGIN */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { contact, method, password } = req.body;
    const cleanContact = String(contact || '').trim().toLowerCase();

    const user = await User.findOne({ contact: cleanContact });

    if (!user || (method && user.method !== method)) {
      return res.status(401).json({
        message: 'Account not found. Please create an account first.'
      });
    }

    if (!await bcrypt.compare(String(password || ''), user.passwordHash)) {
      return res.status(401).json({
        message: 'Incorrect password. Please try again.'
      });
    }

    res.json({
      token: createToken({
        id: user._id.toString(),
        role: 'user',
        contact: user.contact
      }),
      user: publicUser(user)
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to login.',
      error: error.message
    });
  }
});

/* ADMIN LOGIN */
app.post('/api/auth/admin-login', async (req, res) => {
  const username = String(req.body.username || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (
    (username !== ADMIN_USERNAME && username !== 'admin@jpclothing.com') ||
    password !== ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      message: 'Incorrect Admin credentials! Please try again.'
    });
  }

  res.json({
    token: createToken({ id: 'admin', role: 'admin', username }),
    admin: { username, role: 'admin' }
  });
});
/* GET CURRENT USER */
app.get('/api/auth/me', auth(), async (req, res) => {
  try {
    if (req.auth.role === 'admin') {
      return res.json({
        user: {
          id: 'admin',
          username: req.auth.username,
          role: 'admin'
        }
      });
    }

    const user = await User.findById(req.auth.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* GET PRODUCTS */
app.get('/api/products', async (_req, res) => {
  try {
    const deletedIds = await getDeletedIds();

    const builtInProducts = await Promise.all(
      STATIC_PRODUCTS
        .filter(product => !deletedIds.has(String(product.id)))
        .map(async product => {
          const key = `builtin:${String(product.id)}`;

          const inventory = await Inventory.findOne({
            productKey: key
          }).lean();

          return {
            ...product,
            legacyId: String(product.id),
            source: 'builtin',
            stock: inventory?.stock ?? 0
          };
        })
    );

    const customProducts = await Product.find({
      source: { $ne: 'builtin' }
    }).lean();

    res.json([...builtInProducts, ...customProducts]);
  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch products.',
      error: error.message
    });
  }
});

/* ADD CUSTOM PRODUCT */
app.post('/api/products', auth('admin'), async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.n || !String(data.n).trim()) {
      return res.status(400).json({
        message: 'Product name is required.'
      });
    }

    if (data.stock !== undefined && !validStock(data.stock)) {
      return res.status(400).json({
        message: 'Stock must be a non-negative whole number.'
      });
    }

    data.n = String(data.n).trim();
    data.stock = Number(data.stock ?? 0);
    data.source = 'custom';

    delete data._id;
    delete data.inventoryKey;

    const product = await Product.create(data);

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Unable to add product.',
      error: error.message
    });
  }
});

/* UPDATE PRODUCT STOCK */
app.patch('/api/products/:id/stock', auth('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, source, type } = req.body;

    if (!validStock(stock)) {
      return res.status(400).json({
        message: 'Stock must be a non-negative whole number.'
      });
    }

    const cleanStock = Number(stock);
    const productSource = source || type;

    const builtInProduct = STATIC_PRODUCTS.find(
      product => String(product.id) === String(id)
    );

    if (
      builtInProduct &&
      (productSource === 'builtin' || !productSource)
    ) {
      const productKey = `builtin:${String(builtInProduct.id)}`;

      const inventory = await Inventory.findOneAndUpdate(
        { productKey },
        {
          $set: {
            stock: cleanStock,
            updatedAt: new Date()
          }
        },
        {
          new: true,
          upsert: true,
          runValidators: true
        }
      );

      return res.json({
        message: 'Stock updated successfully.',
        id: String(builtInProduct.id),
        source: 'builtin',
        stock: inventory.stock
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: id,
        source: { $ne: 'builtin' }
      },
      { $set: { stock: cleanStock } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    res.json({
      message: 'Stock updated successfully.',
      product
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to update stock.',
      error: error.message
    });
  }
});

/* UPDATE CUSTOM PRODUCT */
app.patch('/api/products/:id', auth('admin'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const data = { ...req.body };

    if (data.stock !== undefined && !validStock(data.stock)) {
      return res.status(400).json({
        message: 'Stock must be a non-negative whole number.'
      });
    }

    delete data._id;
    delete data.inventoryKey;
    delete data.source;

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        source: { $ne: 'builtin' }
      },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Unable to update product.',
      error: error.message
    });
  }
});

/* DELETE PRODUCT */
app.delete('/api/products/:id', auth('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const builtInProduct = STATIC_PRODUCTS.find(
      product => String(product.id) === String(id)
    );

    if (builtInProduct) {
      await DeletedProduct.findOneAndUpdate(
        { productId: String(builtInProduct.id) },
        {
          $set: {
            productId: String(builtInProduct.id),
            deletedAt: new Date()
          }
        },
        { upsert: true, new: true }
      );

      return res.json({
        message: 'Product deleted successfully.'
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    const deleted = await Product.findOneAndDelete({
      _id: id,
      source: { $ne: 'builtin' }
    });

    if (!deleted) {
      return res.status(404).json({
        message: 'Product not found.'
      });
    }

    await Inventory.deleteOne({
      productKey: `custom:${id}`
    });

    res.json({
      message: 'Product deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to delete product.',
      error: error.message
    });
  }
});

/* RESTORE BUILT-IN PRODUCT */
app.delete('/api/products/builtin/:id/restore', auth('admin'), async (req, res) => {
  try {
    await DeletedProduct.deleteOne({
      productId: String(req.params.id)
    });

    res.json({
      message: 'Product restored successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to restore product.',
      error: error.message
    });
  }
});

/* GET ORDERS */
app.get('/api/orders', auth(), async (req, res) => {
  try {
    const query = req.auth.role === 'admin'
      ? {}
      : { userId: req.auth.id };

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Unable to fetch orders.',
      error: error.message
    });
  }
});

/* CREATE ORDER WITH STOCK VALIDATION */
app.post('/api/orders', optionalUser, async (req, res) => {
  const { customer, items, totals, paymentMethod } = req.body;

  if (
    !customer ||
    !Array.isArray(items) ||
    items.length === 0 ||
    !totals ||
    !paymentMethod
  ) {
    return res.status(400).json({
      message: 'Invalid order details.'
    });
  }

  const requested = new Map();

  for (const item of items) {
    const quantity = Number(item.quantity ?? item.qty ?? 1);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        message: 'Invalid product quantity.'
      });
    }

    const key = String(item.legacyId ?? item.id ?? item._id ?? '');

    if (!key) {
      return res.status(400).json({
        message: 'Invalid product in order.'
      });
    }

    requested.set(key, (requested.get(key) || 0) + quantity);
  }

  const stockChanges = [];

  try {
    for (const [requestedId, quantity] of requested.entries()) {
      const item = items.find(
        product =>
          String(product.legacyId ?? product.id ?? product._id ?? '') === requestedId
      );

      const product = await resolveCatalogProduct(item);

      if (!product) {
        throw new Error(`Product ${requestedId} was not found.`);
      }

      if (product.source === 'builtin') {
        const result = await Inventory.findOneAndUpdate(
          {
            productKey: product.inventoryKey,
            stock: { $gte: quantity }
          },
          {
            $inc: { stock: -quantity },
            $set: { updatedAt: new Date() }
          },
          { new: true }
        );

        if (!result) {
          throw new Error(
            `${product.n} has insufficient stock. Available stock: ${product.stock}.`
          );
        }

        stockChanges.push({
          source: 'builtin',
          productKey: product.inventoryKey,
          quantity
        });
      } else {
        const result = await Product.findOneAndUpdate(
          {
            _id: product._id,
            stock: { $gte: quantity }
          },
          { $inc: { stock: -quantity } },
          { new: true }
        );

        if (!result) {
          throw new Error(
            `${product.n} has insufficient stock. Available stock: ${product.stock}.`
          );
        }

        stockChanges.push({
          source: 'custom',
          productKey: String(product._id),
          quantity
        });
      }
    }

    const orderId = `JP${Date.now()}`;

    const order = await Order.create({
      id: orderId,
      userId: req.auth?.role === 'user' ? req.auth.id : null,
      customer,
      items,
      totals,
      paymentMethod,
      paymentVerifiedBySeller: false,
      status: 'Pending'
    });

    res.status(201).json(order);
  } catch (error) {
    for (const change of stockChanges.reverse()) {
      try {
        if (change.source === 'builtin') {
          await Inventory.updateOne(
            { productKey: change.productKey },
            { $inc: { stock: change.quantity } }
          );
        } else {
          await Product.updateOne(
            { _id: change.productKey },
            { $inc: { stock: change.quantity } }
          );
        }
      } catch (rollbackError) {
        console.error('Stock rollback failed:', rollbackError);
      }
    }

    res.status(400).json({
      message: error.message || 'Unable to place order.'
    });
  }
});
/* UPDATE ORDER STATUS */
app.patch('/api/orders/:id/status', auth('admin'), async (req, res) => {
  try {
    const allowedStatuses = [
      'Pending',
      'Approved',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled'
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: 'Invalid order status.'
      });
    }

    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.'
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Unable to update order status.',
      error: error.message
    });
  }
});

/* DELETE ORDER */
app.delete('/api/orders/:id', auth('admin'), async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      id: req.params.id
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.'
      });
    }

    res.json({
      message: 'Order deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Unable to delete order.',
      error: error.message
    });
  }
});

/* MARK ORDERS AS READ */
app.patch('/api/orders/mark-read', auth('admin'), async (_req, res) => {
  try {
    await Order.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    res.json({
      message: 'Orders marked as read.'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

/* START SERVER */
async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('MongoDB connected successfully.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`JP Clothing API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
