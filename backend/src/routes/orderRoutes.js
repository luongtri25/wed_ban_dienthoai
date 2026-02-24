const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const validate = require("../middlewares/validate");
const { createOrder, updateOrder, idParam } = require("../validations/orderValidation");

router.get("/", orderController.getAll);
router.get("/:id", validate({ params: idParam }), orderController.getById);
router.post("/", validate({ body: createOrder }), orderController.create);
router.put("/:id", validate({ params: idParam, body: updateOrder }), orderController.update);
router.delete("/:id", validate({ params: idParam }), orderController.remove);

module.exports = router;
