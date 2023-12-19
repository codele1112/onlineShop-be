const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const { param } = require("express-validator");
/**
 * @rout POST /order
 * @description create an order
 * @body
 * @access Login required
 */

router.post("/", authentication.loginRequired, orderController.createOrder);

/**
 * @rout PUT /order/status/:oId
 * @description Update category
 * @access Login required, Admin
 */

router.put(
  "status/:oId",
  authentication.loginRequired,
  authentication.isAdmin,
  validators.validate([param("oId").exists().custom(validators.checkObjectId)]),
  orderController.updateStatusOrder
);

/**
 * @rout GET /order/admin
 * @description Get all orders
 * @access Login required,Admin
 */

router.get(
  "/admin",
  authentication.loginRequired,
  authentication.isAdmin,
  orderController.getOrders
);

/**
 * @rout GET /order
 * @description Get user's oders
 * @access Login required
 */

router.get("/", authentication.loginRequired, orderController.getUserOrder);

module.exports = router;
