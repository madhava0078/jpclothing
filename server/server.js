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
