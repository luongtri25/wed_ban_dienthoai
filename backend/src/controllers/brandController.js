const brandService = require("../services/brandService");

exports.getAll = async (req, res) => {
  const data = await brandService.getAll();
  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await brandService.getById(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await brandService.create(req.body);
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const data = await brandService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await brandService.remove(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};
