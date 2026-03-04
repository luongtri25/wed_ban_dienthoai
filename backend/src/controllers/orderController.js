const orderService = require("../services/orderService");

exports.getAll = async (req, res) => {
  const data = await orderService.getAllByActor(req.user);
  res.json(data);
};

exports.getById = async (req, res) => {
  const data = await orderService.getByIdByActor(req.params.id, req.user);
  if (!data) return res.status(404).json({ message: "Not found" });
  res.json(data);
};

exports.update = async (req, res) => {
  try {
    const data = await orderService.updateByActor(req.params.id, req.body, req.user);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.create = async (req, res) => {
  try {
    const data = await orderService.createSafe({
      userId: req.user.id,
      ...req.body,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const data = await orderService.removeByActor(req.params.id, req.user);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Cancelled" });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.transitionStatus = async (req, res) => {
  try {
    const data = await orderService.transitionStatusByAdmin(
      req.params.id,
      req.body.status,
      req.user
    );
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.cancelMine = async (req, res) => {
  try {
    const data = await orderService.cancelByUser(req.params.id, req.user);
    if (!data) return res.status(404).json({ message: "Not found" });
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

