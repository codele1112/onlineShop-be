const express = require("express");
const formidableMiddleware = require("express-formidable");
const router = express.Router();
const productController = require("../controllers/product.controller");

const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");
const uploadCloud = require("../middlewares/upload");

/**
 * @rout POST /products
 * @description create a new product
 * @body { name, description, price, category, quantity, image }
 * @access Private - Admin
 */
router.post(
  "/",
  validators.validate([
    body("name", "Invalid name").exists().notEmpty().isString(),
    body("description", "Invalid description").exists().notEmpty().isString(),
    body("price", "Invalid price").exists().notEmpty(),
    body("category", "Invalid category").exists().notEmpty(),
    body("quantity", "Invalid quantity").exists().notEmpty(),
  ]),

  authentication.loginRequired,
  authentication.isAdmin,
  uploadCloud.array("image"),
  productController.createNewProduct
);

/**
 * @rout GET /products
 * @description get all products with pagination
 * @access Public
 */
router.get("/", authentication.loginRequired, productController.getAllProducts);

/**
 * @rout GET /products/:id
 * @description get a single product by ID
 * @query (id)
 * @access Public
 */
router.get(
  "/:id",
  authentication.loginRequired,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  productController.getSingleProduct
);

/**
 * @rout PUT /products/:id
 * @description Update a single product by id
 * @body (name, image,description, price, ratings, stock, numberOfReviews)
 * @access Private - Admin
 */
router.put(
  "/:id",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  productController.updateProduct
);

/**
 * @rout DELETE /products/:id
 * @description Delete a single product by id
 * @access Private - Admin
 */
router.delete(
  "/:id",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([
    param("id").exists().isString().custom(validators.checkObjectId),
  ]),
  productController.deleteProduct
);
module.exports = router;
