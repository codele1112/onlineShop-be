const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).send("Welcome to CoderSchool!");
});

// authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

// userApi
const userApi = require("./user.api");
router.use("/users", userApi);

// productApi
const productApi = require("./product.api");
router.use("/products", productApi);

// productCategoryApi
const categoryApi = require("./productCategory.api");
router.use("/productcategories", categoryApi);

// blogCategoryApi
const blogCategoryApi = require("./blogCategory.api");
router.use("/blogcategories", blogCategoryApi);

// blogApi
const blogApi = require("./blog.api");
router.use("/blogs", blogApi);

// couponApi
const couponApi = require("./coupon.api");
router.use("/coupon", couponApi);

// orderApi
const orderApi = require("./order.api");
router.use("/order", orderApi);

module.exports = router;
