const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middlewares/validate");
const { register, login, googleLogin } = require("../validations/authValidation");

router.post("/register", validate({ body: register }), authController.register);
router.post("/login", validate({ body: login }), authController.login);
router.post("/google", validate({ body: googleLogin }), authController.googleLogin);

module.exports = router;
