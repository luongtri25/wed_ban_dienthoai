const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validate = require("../middlewares/validate");
const {
  createCategory,
  updateCategory,
  idParam,
} = require("../validations/categoryValidation");

router.get("/", categoryController.getAll);
router.get("/:id", validate({ params: idParam }), categoryController.getById);
router.post(
  "/",
  auth,
  admin,
  validate({ body: createCategory }),
  categoryController.create
);
router.put(
  "/:id",
  auth,
  admin,
  validate({ params: idParam, body: updateCategory }),
  categoryController.update
);
router.delete(
  "/:id",
  auth,
  admin,
  validate({ params: idParam }),
  categoryController.remove
);

module.exports = router;
