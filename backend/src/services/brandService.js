const Brand = require("../models/brandModel");

exports.getAll = async () => {
  return await Brand.find().lean();
};

exports.getById = async (id) => {
  return await Brand.findById(id).lean();
};

exports.create = async (payload) => {
  const doc = await Brand.create(payload);
  return doc.toObject();
};

exports.update = async (id, payload) => {
  return await Brand.findByIdAndUpdate(id, payload, { new: true }).lean();
};

exports.remove = async (id) => {
  return await Brand.findByIdAndDelete(id).lean();
};
