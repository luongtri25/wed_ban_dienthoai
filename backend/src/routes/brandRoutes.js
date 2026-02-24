const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validate = require("../middlewares/validate");
const { createBrand, updateBrand, idParam } = require("../validations/brandValidation");

router.get("/", brandController.getAll);
router.get("/:id", validate({ params: idParam }), brandController.getById);
router.post(
  "/",
  auth,
  admin,
  validate({ body: createBrand }),
  brandController.create
);
router.put(
  "/:id",
  auth,
  admin,
  validate({ params: idParam, body: updateBrand }),
  brandController.update
);
router.delete(
  "/:id",
  auth,
  admin,
  validate({ params: idParam }),
  brandController.remove
);

module.exports = router;
