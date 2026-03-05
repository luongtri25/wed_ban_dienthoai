const productService = require("../services/productService");

exports.getAll = async (req, res) => {
  const data = await productService.getAll(req.query);
  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await productService.getById(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.getBySlug = async (req, res) => {
  const data = await productService.getBySlug(req.params.slug);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await productService.create(req.body);
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const data = await productService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await productService.remove(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};

exports.uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image is required" });
  return res.status(201).json({ url: `/productImg/${req.file.filename}` });
};