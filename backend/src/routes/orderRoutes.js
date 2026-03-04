const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validate = require("../middlewares/validate");
const { createOrder, updateStatus, idParam } = require("../validations/orderValidation");

router.get("/", auth, orderController.getAll);
router.get("/:id", auth, validate({ params: idParam }), orderController.getById);
router.post("/", auth, validate({ body: createOrder }), orderController.create);

router.patch(
  "/:id/status",
  auth,
  admin,
  validate({ params: idParam, body: updateStatus }),
  orderController.transitionStatus
);

router.patch(
  "/:id/cancel",
  auth,
  validate({ params: idParam }),
  orderController.cancelMine
);

router.delete("/:id", auth, validate({ params: idParam }), orderController.remove);

module.exports = router;
