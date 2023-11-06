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

/**
 * @rout POST /auth/logout
 * @description Login with username and password.
 * @body (email, password)
 * @access Public
 */

router.get(
  "/logout",
  validators.validate([
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  authController.logout
);

/**
 * @rout GET /auth/forgotpassword
 * @query email
 * @access Public
 */

router.get("/forgotpassword", authController.forgotPassword);

/**
 * @rout PUT /auth/resetpassword
 * @description Login with username and password.
 * @body (email, password)
 * @access Public
 */

router.get("/reset-password/:token", authController.resetPassword);
module.exports = router;
