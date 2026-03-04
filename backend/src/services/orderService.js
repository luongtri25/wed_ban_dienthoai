const mongoose = require("mongoose");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

const httpError = (status, message) => Object.assign(new Error(message), { status });

const ACTOR_TRANSITIONS = Object.freeze({
  admin: {
    pending: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered"],
    delivered: [],
    cancelled: [],
  },
  user: {
    pending: ["cancelled"],
    processing: ["cancelled"],
    shipped: [],
    delivered: [],
    cancelled: [],
  },
});

const normalizeOrderItems = (items = []) => {
  const merged = new Map();

  for (const item of items) {
    const productId = String(item.product || "");
    const qty = Number(item.qty);

    if (!productId || Number.isNaN(qty) || qty <= 0) {
      throw httpError(400, "Invalid order items");
    }

    merged.set(productId, (merged.get(productId) || 0) + qty);
  }

  return Array.from(merged, ([product, qty]) => ({ product, qty }));
};

const canTransition = (role, from, to) => {
  if (!to || to === from) return true;
  const allowed = ACTOR_TRANSITIONS[role]?.[from] || [];
  return allowed.includes(to);
};

const assertValidTransition = (role, from, to) => {
  if (!canTransition(role, from, to)) {
    throw httpError(400, `Invalid status transition: ${from} -> ${to}`);
  }
};

const restockOrderItems = async (items, session) => {
  for (const item of items) {
    await Product.updateOne(
      { _id: item.product },
      { $inc: { stock: item.qty } },
      { session }
    );
  }
};

const getOrderQueryByActor = (id, actor) => {
  if (actor.role === "admin") return { _id: id };
  return { _id: id, user: actor.id };
};

const buildSafePayloadByActor = (payload, actor) => {
  const safePayload = {};

  if (payload.shippingAddress) safePayload.shippingAddress = payload.shippingAddress;
  if (payload.paymentMethod) safePayload.paymentMethod = payload.paymentMethod;

  if (actor.role === "admin") {
    if (payload.paymentStatus) safePayload.paymentStatus = payload.paymentStatus;
    if (payload.status) safePayload.status = payload.status;
    return safePayload;
  }

  if (payload.status === "cancelled") {
    safePayload.status = "cancelled";
  }

  return safePayload;
};

exports.markMomoPaid = async (orderId, txnId) => {
  return Order.findByIdAndUpdate(
    orderId,
    {
      paymentStatus: "paid",
      paymentTxnId: String(txnId || ""),
      paymentNote: "",
    },
    { new: true }
  ).lean();
};

exports.markMomoFailedAndReleaseStock = async (orderId, note = "") => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId).session(session);
    if (!order) throw httpError(404, "Order not found");

    if (order.status !== "cancelled") {
      await restockOrderItems(order.items, session);
      order.status = "cancelled";
    }

    order.paymentStatus = "failed";
    order.paymentNote = note || "MoMo payment failed";
    await order.save({ session });

    await session.commitTransaction();
    return order.toObject();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.createSafe = async ({ userId, items, shippingAddress, paymentMethod }) => {
  const normalizedItems = normalizeOrderItems(items);
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const productIds = normalizedItems.map((item) => item.product);
    const products = await Product.find({
      _id: { $in: productIds },
      isActive: true,
    })
      .session(session)
      .lean();

    if (products.length !== productIds.length) {
      throw httpError(400, "One or more products are invalid or inactive");
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));
    const orderItems = [];
    let itemsPrice = 0;

    for (const item of normalizedItems) {
      const product = productMap.get(item.product);
      if (!product) {
        throw httpError(400, "Product not found");
      }

      const unitPrice =
        typeof product.salePrice === "number" ? product.salePrice : product.price;

      if (product.stock < item.qty) {
        throw httpError(409, `Insufficient stock for product ${product.name}`);
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: unitPrice,
        qty: item.qty,
        image: Array.isArray(product.images) ? product.images[0] || "" : "",
      });

      itemsPrice += unitPrice * item.qty;
    }

    for (const item of normalizedItems) {
      const updated = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { session }
      );

      if (updated.modifiedCount !== 1) {
        throw httpError(409, "Insufficient stock while reserving items");
      }
    }

    const shippingPrice = 0;
    const totalPrice = itemsPrice + shippingPrice;

    const [order] = await Order.create(
      [
        {
          user: userId,
          items: orderItems,
          shippingAddress,
          paymentMethod: paymentMethod || "cod",
          paymentStatus: "pending",
          status: "pending",
          itemsPrice,
          shippingPrice,
          totalPrice,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return order.toObject();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.getAllByActor = async (actor) => {
  if (actor.role === "admin") return Order.find().sort({ createdAt: -1 }).lean();
  return Order.find({ user: actor.id }).sort({ createdAt: -1 }).lean();
};

exports.getByIdByActor = async (id, actor) => {
  if (actor.role === "admin") return Order.findById(id).lean();
  return Order.findOne({ _id: id, user: actor.id }).lean();
};

exports.updateByActor = async (id, payload, actor) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentOrder = await Order.findOne(getOrderQueryByActor(id, actor)).session(session);
    if (!currentOrder) {
      await session.abortTransaction();
      return null;
    }

    const safePayload = buildSafePayloadByActor(payload, actor);
    if (Object.keys(safePayload).length === 0) {
      throw httpError(400, "No allowed fields to update");
    }

    if (safePayload.status) {
      assertValidTransition(actor.role, currentOrder.status, safePayload.status);

      if (safePayload.status === "cancelled" && currentOrder.status !== "cancelled") {
        await restockOrderItems(currentOrder.items, session);
      }
    }

    Object.assign(currentOrder, safePayload);
    await currentOrder.save({ session });

    await session.commitTransaction();
    return currentOrder.toObject();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.removeByActor = async (id, actor) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const currentOrder = await Order.findOne(getOrderQueryByActor(id, actor)).session(session);
    if (!currentOrder) {
      await session.abortTransaction();
      return null;
    }

    if (actor.role === "admin") {
      if (!["cancelled", "delivered"].includes(currentOrder.status)) {
        await restockOrderItems(currentOrder.items, session);
      }

      await Order.deleteOne({ _id: currentOrder._id }, { session });
      await session.commitTransaction();
      return currentOrder.toObject();
    }

    assertValidTransition("user", currentOrder.status, "cancelled");

    if (currentOrder.status !== "cancelled") {
      await restockOrderItems(currentOrder.items, session);
      currentOrder.status = "cancelled";
      await currentOrder.save({ session });
    }

    await session.commitTransaction();
    return currentOrder.toObject();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.transitionStatusByAdmin = async (id, nextStatus, actor) => {
  if (actor.role !== "admin") {
    throw httpError(403, "Admin only");
  }

  return exports.updateByActor(id, { status: nextStatus }, actor);
};

exports.cancelByUser = async (id, actor) => {
  return exports.updateByActor(id, { status: "cancelled" }, actor);
};
