const User = require("../models/userModel");

exports.getAll = async () => {
  return await User.find().lean();
};

exports.getById = async (id) => {
  return await User.findById(id).lean();
};

exports.create = async (payload) => {
  const doc = await User.create(payload);
  return doc.toObject();
};

exports.update = async (id, payload) => {
  return await User.findByIdAndUpdate(id, payload, { new: true }).lean();
};

exports.remove = async (id) => {
  return await User.findByIdAndDelete(id).lean();
};
