const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const paymentController = require("../controllers/paymentController");
const { createOrder } = require("../validations/orderValidation");

router.post("/momo/create", auth, validate({ body: createOrder }), paymentController.createMomo);
router.post("/momo/ipn", paymentController.momoIpn);

module.exports = router;
