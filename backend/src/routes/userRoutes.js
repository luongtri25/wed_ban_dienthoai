const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const validate = require("../middlewares/validate");
const { createUser, updateUser, idParam } = require("../validations/userValidation");

router.get("/", userController.getAll);
router.get("/:id", validate({ params: idParam }), userController.getById);
router.post("/", validate({ body: createUser }), userController.create);
router.put("/:id", validate({ params: idParam, body: updateUser }), userController.update);
router.delete("/:id", validate({ params: idParam }), userController.remove);

module.exports = router;
