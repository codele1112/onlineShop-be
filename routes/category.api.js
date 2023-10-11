const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

const authentication = require("../middlewares/authentication");
/**
 * @rout POST /category
 * @description create category
 * @body {name}
 * @access Private - Admin's role
 */
router.post(
  "/",
  authentication.loginRequired,
  authentication.isAdmin,
  categoryController.createCategory
);

module.exports = router;
