const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const PRODUCT_FIELDS = "_id name slug price salePrice stock images isActive";

const httpError = (status, message) => Object.assign(new Error(message), { status });
const toStrId = (v) => (typeof v === "string" ? v : v?.toString?.() || "");
const unitPriceOf = (p) =>
  typeof p?.salePrice === "number" ? p.salePrice : Number(p?.price || 0);

const formatCart = (cartDoc) => {
  const cart = cartDoc?.toObject ? cartDoc.toObject() : cartDoc || {};
  let totalQty = 0;
  let totalPrice = 0;

  const items = (cart.items || []).reduce((acc, item) => {
    const product = item.product && typeof item.product === "object" ? item.product : null;
    if (!product || !product.isActive) return acc;

    const qty = Number(item.qty || 0);
    const unitPrice = unitPriceOf(product);
    const subtotal = unitPrice * qty;

    totalQty += qty;
    totalPrice += subtotal;

    acc.push({
      productId: toStrId(product._id),
      qty,
      unitPrice,
      subtotal,
      product: {
        id: toStrId(product._id),
        name: product.name,
        slug: product.slug || toStrId(product._id),
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
        image: Array.isArray(product.images) ? product.images[0] || "" : "",
      },
    });

    return acc;
  }, []);

  return {
    items,
    totalQty,
    totalPrice,
  };
};

const getOrCreateCartDoc = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const loadCartWithProducts = async (userId) => {
  return Cart.findOne({ user: userId }).populate("items.product", PRODUCT_FIELDS);
};

const requireProduct = async (productId) => {
  const product = await Product.findById(productId).select(PRODUCT_FIELDS).lean();
  if (!product || !product.isActive) {
    throw httpError(400, "Product invalid or inactive");
  }
  return product;
};

exports.getMyCart = async (userId) => {
  await getOrCreateCartDoc(userId);
  const cart = await loadCartWithProducts(userId);
  return formatCart(cart);
};

exports.addItem = async (userId, { productId, qty }) => {
  const product = await requireProduct(productId);
  if (qty > product.stock) throw httpError(409, "Quantity exceeds stock");

  const cart = await getOrCreateCartDoc(userId);
  const idx = cart.items.findIndex((i) => toStrId(i.product) === productId);

  if (idx >= 0) {
    const nextQty = cart.items[idx].qty + qty;
    if (nextQty > product.stock) throw httpError(409, "Quantity exceeds stock");
    cart.items[idx].qty = nextQty;
  } else {
    cart.items.push({ product: productId, qty });
  }

  await cart.save();
  const populated = await loadCartWithProducts(userId);
  return formatCart(populated);
};

exports.updateItemQty = async (userId, productId, qty) => {
  const product = await requireProduct(productId);
  if (qty > product.stock) throw httpError(409, "Quantity exceeds stock");

  const cart = await getOrCreateCartDoc(userId);
  const idx = cart.items.findIndex((i) => toStrId(i.product) === productId);
  if (idx < 0) throw httpError(404, "Item not found");

  cart.items[idx].qty = qty;
  await cart.save();

  const populated = await loadCartWithProducts(userId);
  return formatCart(populated);
};

exports.removeItem = async (userId, productId) => {
  const cart = await getOrCreateCartDoc(userId);
  const before = cart.items.length;

  cart.items = cart.items.filter((i) => toStrId(i.product) !== productId);
  if (cart.items.length === before) throw httpError(404, "Item not found");

  await cart.save();
  const populated = await loadCartWithProducts(userId);
  return formatCart(populated);
};

exports.clear = async (userId) => {
  const cart = await getOrCreateCartDoc(userId);
  cart.items = [];
  await cart.save();
  return { message: "Cart cleared" };
};