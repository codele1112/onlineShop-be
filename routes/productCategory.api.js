const express = require("express");
const router = express.Router();
const productCategoryController = require("../controllers/productCategory.controller");

const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { param } = require("express-validator");
/**
 * @rout POST /category
 * @description create new category
 * @body (name)
 * @access Login required, Admin
 */

router.post(
  "/",
  authentication.loginRequired,
  authentication.isAdmin,
  productCategoryController.createCategory
);

/**
 * @rout GET /category
 * @description Get all users.
 * @access Public
 */

router.get("/", productCategoryController.getCategory);

/**
 * @rout PUT /category
 * @description Update category
 * @access Login required, Admin
 */

router.put(
  "/:cId",

  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([param("cId").exists().custom(validators.checkObjectId)]),
  productCategoryController.updateCategory
);

/**
 * @rout DELETE /category
 * @description Update category
 * @access Login required, Admin
 */

router.delete(
  "/:cId",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([param("cId").exists().custom(validators.checkObjectId)]),
  productCategoryController.deleteCategory
);

module.exports = router;
