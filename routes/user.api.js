const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");
const uploader = require("../config/cloudinary.config");

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
 * @rout GET /user-stat
 * @description Get users stats
 * @access Admin login required
 */

router.get(
  "/user-stat",
  authentication.loginRequired,
  authentication.isAdmin,
  userController.getUserStats
);

/**
 * @rout GET /users/final-registration
 * @description final register a new account
 * @access Public
 */

router.get("/final-registration/:token", userController.finalRegister);

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
 * @rout PUT /users/me
 * @description Update user's profile
 * @access Login required
 */

router.put(
  "/me",
  authentication.loginRequired,
  uploader.single("avatar"),
  userController.updateUser
);

/**
 * @rout PUT /users/:userId
 * @description Update user's profile by admin
 * @access Login required
 */
router.delete(
  "/:uid",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([
    param("uid", "Invalid userId").exists().custom(validators.checkObjectId),
  ]),
  userController.deleteUser
);
/**
 * @rout GET /users/refreshtoken
 * @description
 */

router.post("/refreshtoken", userController.refreshAccessToken);
/**
 * @rout GET /users/refreshtoken
 * @description Get user profile by ID
 * @access Login required
 */

router.get(
  "/:userId",
  authentication.loginRequired,
  validators.validate([
    param("userId", "Invalid userId").exists().custom(validators.checkObjectId),
  ]),
  userController.getSingleUser
);

/**
 * @rout PUT /users/cart
 * @description Update cart
 */

router.put("/cart", authentication.loginRequired, userController.updateCart);

/**
 * @rout DELETE /users/remove-cart
 * @description Update cart
 * @access Login required
 */

router.delete(
  "/remove-cart/:pid",
  authentication.loginRequired,
  userController.removeProductInCart
);
/**
 * @rout PUT /users/wishlist/:pid
 * @description Update wishlist
 * @access Login required
 */
router.put(
  "/wishlist/:pid",
  authentication.loginRequired,
  validators.validate([
    param("pid", "Invalid productId").exists().custom(validators.checkObjectId),
  ]),
  userController.updateWishlist
);

/**
 * @rout PUT /users/:userId
 * @description Update user's profile by admin
 * @access Login required
 */
router.put(
  "/:uid",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([
    param("uid", "Invalid userId").exists().custom(validators.checkObjectId),
  ]),
  userController.updateUserByAdmin
);

module.exports = router;
