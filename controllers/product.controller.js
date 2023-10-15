const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const fs = require("fs");
const slugify = require("slugify");
const User = require("../models/userModel");
const Product = require("../models/productModel");

const productController = {};

productController.createNewProduct = catchAsync(async (req, res, next) => {
  const fileData = req.files;
  console.log(fileData);

  // const { name, description, price, category, quantity } = req.body;

  // let product = await Product.findOne({ name });
  // if (product)
  //   throw new AppError(400, "Product already existed!", "Create Product Error");

  // product = await Product.create({
  //   name,
  //   description,
  //   price,
  //   category,
  //   quantity,
  // });

  // await calculatePostCount(currentUserId);

  return sendResponse(
    res,
    200,
    true,
    { status: "OK" },
    null,
    "Create new product Successful"
  );
});

productController.getAllProducts = catchAsync(async (req, res, next) => {
  // Get data from request
  const currentUserId = req.userId;
  let { page, limit, ...filter } = { ...req.query };

  // Validation

  // Process
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 4;

  const filterConditions = [
    {
      isDeleted: false,
    },
  ];

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await Product.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let products = await Product.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  //Response
  sendResponse(
    res,
    200,
    true,
    { products, totalPages, count },
    null,
    "Get all products Successful"
  );
});

productController.getSingleProduct = catchAsync(async (req, res, next) => {
  // Get data from request
  const currentUserId = req.userId;
  const productId = req.params.id;
  // Process
  let product = await Product.findById(productId);
  if (!product)
    throw new AppError(400, "Product Not Found", "Get Single Product Error");

  //Response
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Get Single Product Successful"
  );
});

productController.updateProduct = catchAsync(async (req, res, next) => {
  // Get data from request
  const currentUserId = req.userId;
  const productId = req.params.id;
  const { name, description, price, category, quantity, image } = req.body;
  // Validation
  let product = await Product.findById(productId);
  if (!product)
    throw new AppError(400, "Product Not Found", "Update Product Error");

  // Process
  const allows = [
    "name",
    "description",
    "price",
    "category",
    "quantity",
    "image",
  ];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      product[field] = req.body[field];
    }
  });
  await product.save();
  //Response
  return sendResponse(res, 200, true, product, null, "Update post Successful");
});

productController.deleteProduct = catchAsync(async (req, res, next) => {
  // Get data from request
  const productId = req.params.id;
  // Process
  let product = await Product.findOneAndUpdate(
    { _id: productId },
    { isDeleted: true },
    { new: true }
  );
  if (!product)
    throw new AppError(
      400,
      "Product Not Found or User Not Authorized",
      "Delete Product Error"
    );
  //  await calculateProductCount(currentUserId);
  //Response
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Delete product Successful"
  );
});

module.exports = productController;
