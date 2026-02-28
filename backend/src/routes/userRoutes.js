const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");
const admin = require("../middlewares/admin");
const validate = require("../middlewares/validate");
const { createUser, updateUser, idParam } = require("../validations/userValidation");

router.get("/", auth, admin, userController.getAll);
router.get("/:id", auth, admin, validate({ params: idParam }), userController.getById);
router.put(
  "/:id",
  auth,
  admin,
  validate({ params: idParam, body: updateUser }),
  userController.update
);
router.delete("/:id", auth, admin, validate({ params: idParam }), userController.remove);

module.exports = router;
