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

// categoryApi
// const categoryApi = require("./category.api");
// router.use("/category", categoryApi);

module.exports = router;
