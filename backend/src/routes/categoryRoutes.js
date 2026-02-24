const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const validate = require("../middlewares/validate");
const {
  createCategory,
  updateCategory,
  idParam,
} = require("../validations/categoryValidation");

router.get("/", categoryController.getAll);
router.get("/:id", validate({ params: idParam }), categoryController.getById);
router.post("/", validate({ body: createCategory }), categoryController.create);
router.put(
  "/:id",
  validate({ params: idParam, body: updateCategory }),
  categoryController.update
);
router.delete("/:id", validate({ params: idParam }), categoryController.remove);

module.exports = router;
