const Order = require("../models/orderModel");

exports.getAll = async () => {
  return await Order.find().lean();
};

exports.getById = async (id) => {
  return await Order.findById(id).lean();
};

exports.create = async (payload) => {
  const doc = await Order.create(payload);
  return doc.toObject();
};

exports.update = async (id, payload) => {
  return await Order.findByIdAndUpdate(id, payload, { new: true }).lean();
};

exports.remove = async (id) => {
  return await Order.findByIdAndDelete(id).lean();
};
