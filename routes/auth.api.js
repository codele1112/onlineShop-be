const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

const { body } = require("express-validator");
const validators = require("../middlewares/validators");

/**
 * @rout POST /auth/login
 * @description Login with username and password.
 * @body (email, password)
 * @access Public
 */

router.post(
  "/login",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  authController.loginWithEmail
);
module.exports = router;
