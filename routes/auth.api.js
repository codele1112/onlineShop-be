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
    body("email", "Invalid email.")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password.").exists().notEmpty(),
  ]),
  authController.loginWithEmail
);

/**
 * @rout POST /auth/logout
 * @description Logout account.
 * @access Public
 */

router.get("/logout", authController.logout);

/**
 * @rout POST /auth/forgotpassword
 * @query email
 * @access Public
 */

router.post("/forgot-password", authController.forgotPassword);

/**
 * @rout PUT /auth/resetpassword
 * @description Reset password.
 * @body (email, password)
 * @access Public
 */

router.put("/reset-password", authController.resetPassword);
module.exports = router;
