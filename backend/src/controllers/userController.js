const userService = require("../services/userService");

exports.getAll = async (req, res) => {
  const data = await userService.getAll();
  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await userService.getById(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.create = async (req, res) => {
  const data = await userService.create(req.body);
  res.status(201).json(data);
};

exports.update = async (req, res) => {
  const data = await userService.update(req.params.id, req.body);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.remove = async (req, res) => {
  const data = await userService.remove(req.params.id);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted" });
};
