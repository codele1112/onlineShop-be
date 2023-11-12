const express = require("express");
const router = express.Router();
const couponController = require("../controllers/coupon.controller");

const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { param } = require("express-validator");
/**
 * @rout POST /coupon
 * @description create new coupon
 * @body (name, dicount,expire)
 * @access Login required, Admin
 */

router.post(
  "/",
  authentication.loginRequired,
  authentication.isAdmin,
  // validators.validate([
  //   body("name", "Invalid name").exists().notEmpty(),
  //   body("dicount", "Invalid discount").exists().isNumber(),
  // ]),
  couponController.createCoupon
);

/**
 * @rout GET /category
 * @description Get all users.
 * @access Public
 */

router.get("/", couponController.getCoupons);

/**
 * @rout PUT /category
 * @description Update category
 * @access Login required, Admin
 */

router.put(
  "/:cid",

  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([param("cid").exists().custom(validators.checkObjectId)]),
  couponController.updateCoupon
);

/**
 * @rout DELETE /category
 * @description Update category
 * @access Login required, Admin
 */

router.delete(
  "/:cid",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([param("cid").exists().custom(validators.checkObjectId)]),
  couponController.deleteCoupon
);

module.exports = router;
