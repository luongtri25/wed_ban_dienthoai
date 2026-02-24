const Product = require("../models/productModel");

exports.getAll = async () => {
  return await Product.find().lean();
};

exports.getById = async (id) => {
  return await Product.findById(id).lean();
};

exports.create = async (payload) => {
  const doc = await Product.create(payload);
  return doc.toObject();
};

exports.update = async (id, payload) => {
  return await Product.findByIdAndUpdate(id, payload, { new: true }).lean();
};

exports.remove = async (id) => {
  return await Product.findByIdAndDelete(id).lean();
};
