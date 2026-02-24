const Category = require("../models/categoryModel");

exports.getAll = async () => {
  return await Category.find().lean();
};

exports.getById = async (id) => {
  return await Category.findById(id).lean();
};

exports.create = async (payload) => {
  const doc = await Category.create(payload);
  return doc.toObject();
};

exports.update = async (id, payload) => {
  return await Category.findByIdAndUpdate(id, payload, { new: true }).lean();
};

exports.remove = async (id) => {
  return await Category.findByIdAndDelete(id).lean();
};
