const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const uploader = require("../config/cloudinary.config");

const { body, param } = require("express-validator");
const validators = require("../middlewares/validators");
const authentication = require("../middlewares/authentication");

/**
 * @rout POST /products
 * @description create a new product
 * @body { name, description, price, category, stock, images }
 * @access Login required- Admin
 */
router.post(
  "/",
  validators.validate([
    body("name", "Invalid name").exists().notEmpty(),
    body("description", "Invalid description").exists().notEmpty(),
    body("price", "Invalid price").exists().notEmpty(),
    body("stock", "Invalid stock").exists().notEmpty(),
  ]),
  uploader.fields([
    { name: "images", maxCount: 10 },
    { name: "thumb", maxCount: 1 },
  ]),
  authentication.loginRequired,
  authentication.isAdmin,
  productController.createNewProduct
);

/**
 * @rout GET /products
 * @description get all products with pagination
 * @access Public
 */
router.get("/", productController.getAllProducts);

/**
 * @rout GET /products/:pid
 * @description get a single product by ID
 * @query (pid)
 * @access Public
 */
router.get(
  "/:pid",
  validators.validate([
    param("pid").exists().isString().custom(validators.checkObjectId),
  ]),
  productController.getSingleProduct
);

/**
 * @rout PUT /products/ratings
 * @description Rating a single product by id
 * @access Login required
 */
router.put(
  "/ratings",
  authentication.loginRequired,
  productController.ratingProduct
);

/**
 * @rout PUT /products/uploadimage/:pid
 * @description Upload images for a product by product id
 * @access Login required,Admin
 */
router.put(
  "/uploadimage/:pid",
  authentication.loginRequired,
  authentication.isAdmin,
  uploader.array("images", 10),
  productController.uploadProductImages
);
/**
 * @rout PUT /products/:pid
 * @description Update a single product by id
 * @body (name, image,description, price, ratings, stock, numberOfReviews)
 * @access Private - Admin
 */
router.put(
  "/:pid",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([param("pid").exists().custom(validators.checkObjectId)]),
  // TODO : can chuyen vao trong api chinh
  uploader.fields([
    { name: "images", maxCount: 10 },
    { name: "thumb", maxCount: 1 },
  ]),
  productController.updateProduct
);

/**
 * @rout DELETE /products/:pid
 * @description Delete a single product by id
 * @access Private - Admin
 */
router.delete(
  "/:pid",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([
    param("pid").exists().isString().custom(validators.checkObjectId),
  ]),
  productController.deleteProduct
);

module.exports = router;
