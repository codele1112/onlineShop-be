const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const fs = require("fs");
const slugify = require("slugify");
const User = require("../models/userModel");
const Product = require("../models/productModel");

const productController = {};

productController.createNewProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, quantity, image } = req.body;

  let product = await Product.findOne({ name });
  if (product)
    throw new AppError(400, "Product already existed!", "Create Product Error");

  product = await Product.create({
    name,
    description,
    price,
    category,
    quantity,
    image,
  });

  // await calculatePostCount(currentUserId);

  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Create new product Successful"
  );
});

productController.getAllProducts = catchAsync(async (req, res, next) => {});

productController.getSingleProduct = catchAsync(async (req, res, next) => {});

productController.updateProduct = catchAsync(async (req, res, next) => {});

productController.deleteProduct = catchAsync(async (req, res, next) => {});

module.exports = productController;
