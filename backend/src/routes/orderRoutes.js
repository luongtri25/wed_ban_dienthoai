const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validate = require("../middlewares/validate");
const { createOrder, updateOrder, idParam } = require("../validations/orderValidation");

router.get("/", auth, admin, orderController.getAll);
router.get("/:id", auth, admin, validate({ params: idParam }), orderController.getById);
router.post("/", auth, validate({ body: createOrder }), orderController.create);
router.put(
  "/:id",
  auth,
  admin,
  validate({ params: idParam, body: updateOrder }),
  orderController.update
);
router.delete("/:id", auth, admin, validate({ params: idParam }), orderController.remove);

module.exports = router;
