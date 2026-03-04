const paymentService = require("../services/paymentService");

exports.createMomo = async (req, res) => {
  try {
    const data = await paymentService.createMomoPayment({
      userId: req.user.id,
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message || "Server error" });
  }
};

exports.momoIpn = async (req, res) => {
  try {
    await paymentService.handleMomoIpn(req.body);
    return res.status(204).end();
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "IPN error" });
  }
};
