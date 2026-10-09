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

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/jp_clothing';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'change-this-secret-in-production';

const ADMIN_USERNAME =
  (process.env.ADMIN_USERNAME || 'jpadmin').toLowerCase();

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || 'jp007';

app.use(cors({ origin: true, credentials: true }));

app.use(
  express.json({
    limit: '5mb'
  })
);

/* =========================================================
   USER SCHEMA
========================================================= */

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  contact: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  method: {
    type: String,
    enum: ['phone', 'email'],
    required: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: 'user'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

/* =========================================================
   ORDER SCHEMA
========================================================= */

const orderSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  customer: {
    type: Object,
    required: true
  },

  items: {
    type: Array,
    required: true
  },

  totals: {
    type: Object,
    required: true
  },

  paymentMethod: {
    type: String,
    required: true
  },

  paymentVerifiedBySeller: {
    type: Boolean,
    default: false
  },

  status: {
    type: String,
    enum: [
      'Pending',
      'Approved',
      'Processing',
      'Shipped',
      'Delivered',
      'Cancelled'
    ],
    default: 'Pending'
  },

  invoiceNumber: {
    type: String,
    default: null,
    unique: true,
    sparse: true
  },

  isRead: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

/* =========================================================
   PRODUCT SCHEMA
   These are products added through Admin Panel.
========================================================= */

const productSchema = new mongoose.Schema(
  {
    n: {
      type: String,
      required: true
    },

    c: String,

    a: String,

    p: Number,

    o: Number,

    t: String,

    fabric: String,

    description: String,

    sizes: Array,

    colors: Array,

    image: String,

    stock: { type: Number, default: 0, min: 0 },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    strict: false
  }
);

/* =========================================================
   DELETED PRODUCT SCHEMA
   Used for products that originally come from
   frontend static PRODUCTS data.

   Example:
   productId = "1"
   productId = "25"
   productId = "101"
========================================================= */

const deletedProductSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    deletedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

/* =========================================================
   MODELS
========================================================= */

const User = mongoose.model('User', userSchema);

const Order = mongoose.model('Order', orderSchema);

const Product = mongoose.model('Product', productSchema);

const DeletedProduct = mongoose.model(
  'DeletedProduct',
  deletedProductSchema
);

/* =========================================================
   JWT
========================================================= */

function createToken(payload) {
  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
}

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

function auth(requiredRole = null) {
  return (req, res, next) => {
    const header =
      req.headers.authorization || '';

    const token = header.startsWith('Bearer ')
      ? header.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({
        message: 'Authentication required.'
      });
    }

    try {
      req.auth = jwt.verify(
        token,
        JWT_SECRET
      );

      if (
        requiredRole &&
        req.auth.role !== requiredRole
      ) {
        return res.status(403).json({
          message: 'Admin access required.'
        });
      }

      next();
    } catch {
      return res.status(401).json({
        message:
          'Session expired. Please login again.'
      });
    }
  };
}

/* =========================================================
   PUBLIC USER
========================================================= */

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

/* =========================================================
   HEALTH
========================================================= */

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'JP Clothing API'
  });
});

/* =========================================================
   USER SIGNUP
========================================================= */

app.post('/api/auth/signup', async (req, res) => {
  try {
    const {
      name,
      contact,
      method,
      password
    } = req.body;

    const cleanName =
      String(name || '').trim();

    const cleanContact =
      String(contact || '')
        .trim()
        .toLowerCase();

    if (
      !cleanName ||
      !cleanContact ||
      !password
    ) {
      return res.status(400).json({
        message:
          'Name, contact and password are required.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        message:
          'Password must be at least 6 characters.'
      });
    }

    const existing =
      await User.findOne({
        contact: cleanContact
      });

    if (existing) {
      return res.status(409).json({
        message:
          'An account already exists. Please login instead.'
      });
    }

    const passwordHash =
      await bcrypt.hash(
        String(password),
        12
      );

    const user =
      await User.create({
        name: cleanName,
        contact: cleanContact,
        method:
          method === 'email'
            ? 'email'
            : 'phone',
        passwordHash
      });

    const profile =
      publicUser(user);

    const token =
      createToken({
        id: user._id.toString(),
        role: 'user',
        contact: user.contact
      });

    res.status(201).json({
      token,
      user: profile
    });
  } catch (error) {
    res.status(500).json({
      message:
        'Unable to create account.',
      error: error.message
    });
  }
});

/* =========================================================
   USER LOGIN
========================================================= */

app.post('/api/auth/login', async (req, res) => {
  try {
    const {
      contact,
      method,
      password
    } = req.body;

    const cleanContact =
      String(contact || '')
        .trim()
        .toLowerCase();

    const user =
      await User.findOne({
        contact: cleanContact
      });

    if (
      !user ||
      (method &&
        user.method !== method)
    ) {
      return res.status(401).json({
        message:
          'Account not found. Please create an account first.'
      });
    }

    const valid =
      await bcrypt.compare(
        String(password || ''),
        user.passwordHash
      );

    if (!valid) {
      return res.status(401).json({
        message:
          'Incorrect password. Please try again.'
      });
    }

    const profile =
      publicUser(user);

    const token =
      createToken({
        id: user._id.toString(),
        role: 'user',
        contact: user.contact
      });

    res.json({
      token,
      user: profile
    });
  } catch (error) {
    res.status(500).json({
      message:
        'Unable to login.',
      error: error.message
    });
  }
});

/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post(
  '/api/auth/admin-login',
  async (req, res) => {
    const username =
      String(
        req.body.username || ''
      )
        .trim()
        .toLowerCase();

    const password =
      String(
        req.body.password || ''
      );

    const accepted =
      username === ADMIN_USERNAME ||
      username ===
        'admin@jpclothing.com';

    if (
      !accepted ||
      password !== ADMIN_PASSWORD
    ) {
      return res.status(401).json({
        message:
          'Incorrect Admin credentials! Please try again.'
      });
    }

    const token =
      createToken({
        id: 'admin',
        role: 'admin',
        username
      });

    res.json({
      token,
      admin: {
        username,
        role: 'admin'
      }
    });
  }
);

/* =========================================================
   OPTIONAL USER AUTH
========================================================= */

function optionalUser(
  req,
  _res,
  next
) {
  const header =
    req.headers.authorization || '';

  const token =
    header.startsWith('Bearer ')
      ? header.slice(7)
      : null;

  if (token) {
    try {
      const decoded =
        jwt.verify(
          token,
          JWT_SECRET
        );

      if (
        decoded.role === 'user'
      ) {
        req.auth = decoded;
      }
    } catch {}
  }

  next();
}

/* =========================================================
   GET ALL ORDERS - ADMIN
========================================================= */

app.get(
  '/api/orders',
  auth('admin'),
  async (req, res) => {
    try {
      const orders =
        await Order.find()
          .sort({
            createdAt: -1
          })
          .lean();

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to load orders.'
      });
    }
  }
);

/* =========================================================
   DELETE ORDER - ADMIN
   Permanently removes an order from MongoDB.
========================================================= */

app.delete(
  '/api/orders/:id',
  auth('admin'),
  async (req, res) => {
    try {
      const orderId = String(req.params.id || '').trim();

      if (!orderId) {
        return res.status(400).json({
          message: 'Order ID is required.'
        });
      }

      const deleted = await Order.findOneAndDelete({
        id: orderId
      });

      if (!deleted) {
        return res.status(404).json({
          message: 'Order not found.'
        });
      }

      return res.json({
        ok: true,
        id: orderId
      });
    } catch (error) {
      console.error('Delete order error:', error);
      return res.status(500).json({
        message: 'Unable to delete order.',
        error: error.message
      });
    }
  }
);

/* =========================================================
   GET MY ORDERS - USER
========================================================= */

app.get(
  '/api/orders/me',
  auth('user'),
  async (req, res) => {
    try {
      const contact =
        String(
          req.auth.contact || ''
        )
          .trim()
          .toLowerCase();

      const orders =
        await Order.find({
          $or: [
            {
              userId:
                req.auth.id
            },

            ...(contact
              ? [
                  {
                    'customer.phone':
                      contact
                  },

                  {
                    'customer.email':
                      contact
                  }
                ]
              : [])
          ]
        })
          .sort({
            createdAt: -1
          })
          .lean();

      res.json(orders);
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to load your orders.'
      });
    }
  }
);

/* =========================================================
   CREATE ORDER
========================================================= */

app.post(
  '/api/orders',
  optionalUser,
  async (req, res) => {
    try {
      const {
        customer,
        items,
        totals,
        paymentMethod
      } = req.body;

      if (
        !customer ||
        !Array.isArray(items) ||
        !items.length ||
        !totals
      ) {
        return res.status(400).json({
          message:
            'Incomplete order data.'
        });
      }

      let linkedUserId =
        req.auth?.id || null;

      if (!linkedUserId) {
        const checkoutContact =
          String(
            customer.phone ||
              customer.email ||
              ''
          )
            .trim()
            .toLowerCase();

        if (checkoutContact) {
          const matchingUser =
            await User.findOne({
              contact:
                checkoutContact
            })
              .select('_id')
              .lean();

          linkedUserId =
            matchingUser?._id ||
            null;
        }
      }

      const order =
        await Order.create({
          id:
            'JP-' +
            Math.floor(
              100000 +
                Math.random() *
                  900000
            ),

          userId:
            linkedUserId,

          customer,

          items,

          totals,

          paymentMethod:
            paymentMethod ||
            'UPI (GPay / PhonePe)',

          paymentVerifiedBySeller:
            false,

          status: 'Pending',

          isRead: false
        });

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to place order.',
        error: error.message
      });
    }
  }
);

/* =========================================================
   UPDATE ORDER STATUS
========================================================= */

app.patch(
  '/api/orders/:id/status',
  auth('admin'),
  async (req, res) => {
    try {
      const allowed = [
        'Pending',
        'Approved',
        'Processing',
        'Shipped',
        'Delivered',
        'Cancelled'
      ];

      const status =
        String(
          req.body.status || ''
        );

      if (
        !allowed.includes(status)
      ) {
        return res.status(400).json({
          message:
            'Invalid order status.'
        });
      }

      const update = {
        status,

        ...(status === 'Approved'
          ? {
              paymentVerifiedBySeller:
                true
            }
          : {})
      };

      if (status === 'Approved') {
        const existing =
          await Order.findOne({
            id: req.params.id
          });

        if (!existing) {
          return res.status(404).json({
            message:
              'Order not found.'
          });
        }

        if (
          !existing.invoiceNumber
        ) {
          const datePart =
            new Date()
              .toISOString()
              .slice(0, 10)
              .replaceAll(
                '-',
                ''
              );

          update.invoiceNumber =
            `JPC-INV-${datePart}-${Math.floor(
              100000 +
                Math.random() *
                  900000
            )}`;
        }
      }

      const order =
        await Order.findOneAndUpdate(
          {
            id: req.params.id
          },

          {
            $set: update
          },

          {
            new: true
          }
        ).lean();

      if (!order) {
        return res.status(404).json({
          message:
            'Order not found.'
        });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to update order status.'
      });
    }
  }
);

/* =========================================================
   MARK ORDERS AS READ
========================================================= */

app.patch(
  '/api/orders/read',
  auth('admin'),
  async (req, res) => {
    try {
      await Order.updateMany(
        {
          isRead: false
        },
        {
          $set: {
            isRead: true
          }
        }
      );

      res.json({
        ok: true
      });
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to mark orders as read.'
      });
    }
  }
);

/* =========================================================
   GET CUSTOM PRODUCTS
========================================================= */

app.get(
  '/api/products/custom',
  async (req, res) => {
    try {
      const products =
        await Product.find()
          .sort({
            createdAt: -1
          })
          .lean();

      res.json(products);
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to load custom products.'
      });
    }
  }
);

/* =========================================================
   GET DELETED STATIC PRODUCT IDS
========================================================= */

app.get(
  '/api/products/deleted',
  async (req, res) => {
    try {
      const deleted =
        await DeletedProduct.find()
          .select('productId -_id')
          .lean();

      const deletedProductIds =
        deleted.map(
          item => item.productId
        );

      res.json({
        deletedProductIds
      });
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to load deleted products.'
      });
    }
  }
);

/* =========================================================
   ADD CUSTOM PRODUCT
========================================================= */

app.post(
  '/api/products/custom',
  auth('admin'),
  async (req, res) => {
    try {
      const product =
        await Product.create(
          req.body
        );

      res.status(201).json(
        product
      );
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to add product.',
        error:
          error.message
      });
    }
  }
);

/* =========================================================
   DELETE CUSTOM PRODUCT
========================================================= */

app.delete(
  '/api/products/custom/:id',
  auth('admin'),
  async (req, res) => {
    try {
      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res.status(404).json({
          message:
            'Custom product not found.'
        });
      }

      await Product.findByIdAndDelete(
        req.params.id
      );

      res.json({
        ok: true,
        type: 'custom',
        id: req.params.id
      });
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to delete product.'
      });
    }
  }
);

/* =========================================================
   DELETE STATIC / BUILT-IN PRODUCT
=========================================================

   Static products are currently inside:

   src/data/products.js

   They don't exist in MongoDB.

   So instead of trying to delete them from
   MongoDB, we save their ID in DeletedProduct.

   Example:

   DELETE /api/products/builtin/12

   MongoDB saves:

   {
      productId: "12"
   }

========================================================= */

app.delete(
  '/api/products/builtin/:id',
  auth('admin'),
  async (req, res) => {
    try {
      const productId =
        String(
          req.params.id
        ).trim();

      if (!productId) {
        return res.status(400).json({
          message:
            'Product ID is required.'
        });
      }

      await DeletedProduct.findOneAndUpdate(
        {
          productId
        },

        {
          $set: {
            productId,
            deletedAt:
              new Date()
          }
        },

        {
          upsert: true,
          new: true
        }
      );

      res.json({
        ok: true,
        type: 'builtin',
        id: productId
      });
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to delete built-in product.',
        error:
          error.message
      });
    }
  }
);

/* =========================================================
   RESTORE STATIC / BUILT-IN PRODUCT
========================================================= */

app.delete(
  '/api/products/builtin/:id/restore',
  auth('admin'),
  async (req, res) => {
    try {
      const productId =
        String(
          req.params.id
        ).trim();

      await DeletedProduct.deleteOne({
        productId
      });

      res.json({
        ok: true,
        type: 'builtin',
        restored: true,
        id: productId
      });
    } catch (error) {
      res.status(500).json({
        message:
          'Unable to restore product.'
      });
    }
  }
);

/* =========================================================
   DELETE PRODUCT - UNIFIED ADMIN API
=========================================================

   This endpoint lets the admin panel send:

   {
      "type": "custom"
   }

   OR

   {
      "type": "builtin"
   }

========================================================= */

app.delete(
  '/api/products/:id',
  auth('admin'),
  async (req, res) => {
    try {
      const productId =
        String(
          req.params.id
        ).trim();

      const type =
        String(
          req.body?.type || ''
        ).toLowerCase();

      if (!productId) {
        return res.status(400).json({
          message:
            'Product ID is required.'
        });
      }

      /* -----------------------------
         CUSTOM PRODUCT
      ----------------------------- */

      if (type === 'custom') {
        const product =
          await Product.findById(
            productId
          );

        if (!product) {
          return res.status(404).json({
            message:
              'Custom product not found.'
          });
        }

        await Product.findByIdAndDelete(
          productId
        );

        return res.json({
          ok: true,
          type: 'custom',
          id: productId
        });
      }

      /* -----------------------------
         BUILT-IN PRODUCT
      ----------------------------- */

      if (type === 'builtin') {
        // Built-in products are also stored in MongoDB. Remove the actual
        // Product document so it disappears from both admin and storefront,
        // then remember the legacy id so seedStaticProducts() never recreates it.
        let product = null;

        if (mongoose.isValidObjectId(productId)) {
          product = await Product.findById(productId);
        }

        if (!product) {
          product = await Product.findOne({
            $or: [
              { legacyId: productId },
              { id: productId }
            ],
            source: 'builtin'
          });
        }

        const legacyId = String(
          product?.legacyId ||
          product?.id ||
          productId
        );

        if (product) {
          await Product.findByIdAndDelete(product._id);
        }

        await DeletedProduct.findOneAndUpdate(
          {
            productId: legacyId
          },
          {
            $set: {
              productId: legacyId,
              deletedAt: new Date()
            }
          },
          {
            upsert: true,
            new: true
          }
        );

        return res.json({
          ok: true,
          type: 'builtin',
          id: productId,
          legacyId
        });
      }

      /* -----------------------------
         AUTO DETECT
      ----------------------------- */

      const possibleMongoId =
        mongoose.isValidObjectId(
          productId
        );

      if (possibleMongoId) {
        const product =
          await Product.findById(
            productId
          );

        if (product) {
          const type =
            product.source === 'builtin'
              ? 'builtin'
              : 'custom';

          await Product.findByIdAndDelete(
            productId
          );

          if (type === 'builtin') {
            await DeletedProduct.findOneAndUpdate(
              {
                productId: String(
                  product.legacyId || product.id
                )
              },
              {
                $set: {
                  productId: String(
                    product.legacyId || product.id
                  ),
                  deletedAt: new Date()
                }
              },
              {
                upsert: true,
                new: true
              }
            );
          }

          return res.json({
            ok: true,
            type,
            id: productId
          });
        }
      }

      await DeletedProduct.findOneAndUpdate(
        {
          productId
        },

        {
          $set: {
            productId,
            deletedAt:
              new Date()
          }
        },

        {
          upsert: true,
          new: true
        }
      );

      return res.json({
        ok: true,
        type: 'builtin',
        id: productId
      });
    } catch (error) {
      console.error(
        'Delete product error:',
        error
      );

      res.status(500).json({
        message:
          'Unable to delete product.',
        error:
          error.message
      });
    }
  }
);


/* =========================================================
   UNIFIED PRODUCT CATALOG
   MongoDB is the single source of truth for the storefront.
========================================================= */

app.get(
  '/api/products',
  async (req, res) => {
    try {
      // The original 8 catalog products live in src/data/products.js.
      // MongoDB stores only the admin/custom products and the deleted-product
      // markers. This prevents the original catalog from ever becoming 16
      // products because of database seeding/duplication.
      const deleted = await DeletedProduct.find()
        .select('productId -_id')
        .lean();

      const deletedIds = new Set(
        deleted.map(item => String(item.productId))
      );

      const builtinProducts = STATIC_PRODUCTS
        .filter(product => !deletedIds.has(String(product.id)))
        .map(product => ({
          ...product,
          source: 'builtin',
          legacyId: String(product.id)
        }));

      const customProducts = await Product.find({
        source: { $ne: 'builtin' }
      })
        .sort({ createdAt: -1 })
        .lean();

      // Hide any old database copy of one of the original static products.
      // The static file is now the single source for those 8 products.
      const staticKeys = new Set(
        STATIC_PRODUCTS.map(product =>
          `${product.n}__${product.image}`
        )
      );

      const cleanCustomProducts = customProducts.filter(product =>
        !staticKeys.has(`${product.n}__${product.image}`)
      );

      res.json([
        ...builtinProducts,
        ...cleanCustomProducts
      ]);
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        message: 'Unable to load products.'
      });
    }
  }
);

app.post(
  '/api/products',
  auth('admin'),
  async (req, res) => {
    try {
      const product = await Product.create({
        ...req.body,
        source: 'custom',
        createdAt: new Date()
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Add product error:', error);
      res.status(500).json({
        message: 'Unable to add product.',
        error: error.message
      });
    }
  }
);

app.patch(
  '/api/products/:id',
  auth('admin'),
  async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          message: 'Product not found.'
        });
      }

      res.json(product);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({
        message: 'Unable to update product.',
        error: error.message
      });
    }
  }
);

async function cleanupOldCatalogCopies() {
  let removed = 0;

  // Previous versions seeded the 8 static products into MongoDB. Remove
  // those old copies now; the static file is the source of truth for the
  // original catalog. Admin/custom products remain untouched unless they
  // are an exact old copy of one of the original catalog items.
  for (const product of STATIC_PRODUCTS) {
    const result = await Product.deleteMany({
      n: product.n,
      image: product.image
    });

    removed += result.deletedCount || 0;
  }

  if (removed > 0) {
    console.log(
      `Removed ${removed} old duplicated catalog product record(s) from MongoDB.`
    );
  }
}

/* =========================================================
   START SERVER
========================================================= */

async function start() {
  try {
    await mongoose.connect(
      MONGODB_URI
    );

    console.log(
      `MongoDB connected: ${MONGODB_URI.replace(
        /:\/\/.*@/,
        '://***@'
      )}`
    );

    await cleanupOldCatalogCopies();

    app.listen(
      PORT,
      () => {
        console.log(
          `JP Clothing API running on http://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      'MongoDB connection failed. Check MONGODB_URI in .env.'
    );

    console.error(
      error.message
    );

    process.exit(1);
  }
}

start();