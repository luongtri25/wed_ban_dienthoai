const cartService = require("../services/cartService");

exports.getMine = async (req, res) => {
  try {
    const data = await cartService.getMyCart(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.addItem = async (req, res) => {
  try {
    const data = await cartService.addItem(req.user.id, req.body);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.updateItemQty = async (req, res) => {
  try {
    const data = await cartService.updateItemQty(
      req.user.id,
      req.params.productId,
      req.body.qty
    );
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const data = await cartService.removeItem(req.user.id, req.params.productId);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.clear = async (req, res) => {
  try {
    const data = await cartService.clear(req.user.id);
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};
