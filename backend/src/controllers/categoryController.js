const categoryService = require("../services/categoryService");

exports.getAll = async (req, res) => {
  const data = await categoryService.getAll();
  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await categoryService.getById(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await categoryService.create(req.body);
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const data = await categoryService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await categoryService.remove(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};
