const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const cartController = require("../controllers/cartController");
const { addItem, updateQty, productParam } = require("../validations/cartValidation");

router.use(auth);

router.get("/", cartController.getMine);
router.post("/items", validate({ body: addItem }), cartController.addItem);
router.put(
  "/items/:productId",
  validate({ params: productParam, body: updateQty }),
  cartController.updateItemQty
);
router.delete(
  "/items/:productId",
  validate({ params: productParam }),
  cartController.removeItem
);
router.delete("/", cartController.clear);

module.exports = router;