const express = require("express");
const router = express.Router();
const blogCategoryController = require("../controllers/blogCategory.controller");

const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { param } = require("express-validator");
/**
 * @rout POST /category
 * @description register a new account
 * @body (email, password)
 * @access Login required, Admin
 */

router.post(
  "/",
  authentication.loginRequired,
  authentication.isAdmin,
  blogCategoryController.createCategory
);

/**
 * @rout GET /category
 * @description Get all users.
 * @access Public
 */

router.get("/", blogCategoryController.getCategory);

/**
 * @rout PUT /category
 * @description Update category
 * @access Login required, Admin
 */

router.put(
  "/:bcId",

  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([
    param("bcId").exists().custom(validators.checkObjectId),
  ]),
  blogCategoryController.updateCategory
);

/**
 * @rout DELETE /category
 * @description Update category
 * @access Login required, Admin
 */

router.delete(
  "/:bcId",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([
    param("bcId").exists().custom(validators.checkObjectId),
  ]),
  blogCategoryController.deleteCategory
);

module.exports = router;
