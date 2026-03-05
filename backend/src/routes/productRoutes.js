const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validate = require("../middlewares/validate");
const uploadProductImage = require("../middlewares/uploadProductImage");
const {
  createProduct,
  updateProduct,
  idParam,
  slugParam,
  listQuery,
} = require("../validations/productValidation");

router.get("/", validate({ query: listQuery }), productController.getAll);
router.get("/slug/:slug", validate({ params: slugParam }), productController.getBySlug);
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

router.post(
  "/upload-image",
  auth,
  admin,
  uploadProductImage,
  productController.uploadImage
);

module.exports = router;
