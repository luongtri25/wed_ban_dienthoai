const orderService = require("../services/orderService");

exports.getAll = async (req, res) => {
  const data = await orderService.getAll();
  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await orderService.getById(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await orderService.create({
    ...req.body,
    user: req.user.id,
  });
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const data = await orderService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await orderService.remove(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};
