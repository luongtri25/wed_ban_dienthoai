const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const validate = require("../middlewares/validate");
const {
  createProduct,
  updateProduct,
  idParam,
} = require("../validations/productValidation");

router.get("/", productController.getAll);
router.get("/:id", validate({ params: idParam }), productController.getById);
router.post("/", validate({ body: createProduct }), productController.create);
router.put(
  "/:id",
  validate({ params: idParam, body: updateProduct }),
  productController.update
);
router.delete("/:id", validate({ params: idParam }), productController.remove);

module.exports = router;
