const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

/**
 * @rout POST /users/register
 * @description register a new account
 * @body (email, password)
 * @access Public
 */

router.post(
  "/register",
  validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password").exists().notEmpty(),
  ]),
  userController.register
);

/**
 * @rout GET /users
 * @description Get all users.
 * @access Login required
 */

router.get(
  "/",
  authentication.loginRequired,
  authentication.isAdmin,

  userController.getAllUsers
);

/**
 * @rout GET /users/me
 * @description Get current user profile
 * @access Login required
 */

router.get("/me", authentication.loginRequired, userController.getCurrentUser);

/**
 * @rout GET /users/me
 * @description Get user profile by ID
 * @access Login required
 */

router.get(
  "/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId", "Invalid userId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  userController.getSingleUser
);

/**
 * @rout PUT /users/:userId
 * @description Update user's profile by userId
 * @access Login required
 */

router.put(
  "/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId", "Invalid userId")
      .exists()
      .isString()
      .custom(validators.checkObjectId),
  ]),
  userController.updateUser
);

module.exports = router;
