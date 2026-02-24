const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validate = require("../middlewares/validate");
const {
  createProduct,
  updateProduct,
  idParam,
} = require("../validations/productValidation");

router.get("/", productController.getAll);
router.get("/:id", validate({ params: idParam }), productController.getById);
router.post(
  "/",
  auth,
  admin,
  validate({ body: createProduct }),
  productController.create
);
router.put(
  "/:id",
  auth,
  admin,
  validate({ params: idParam, body: updateProduct }),
  productController.update
);
router.delete(
  "/:id",
  auth,
  admin,
  validate({ params: idParam }),
  productController.remove
);

module.exports = router;
