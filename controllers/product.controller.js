const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const fs = require("fs");
const slugify = require("slugify");
const Product = require("../models/product");

const productController = {};

productController.createNewProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, category, quantity } = req.body;

  let product = await Product.findOne({ name });
  if (product)
    throw new AppError(400, "Product already existed!", "Create Product Error");
  let slug = slugify(req.body.name);
  product = await Product.create({
    name,
    description,
    price,
    category,
    quantity,
    slug,
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

// Filtering, Sorting & Pagination
productController.getAllProducts = catchAsync(async (req, res, next) => {
  // Get data from request

  let queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  // Filtering
  if (queries?.name)
    formatedQueries.name = { $regex: queries.name, $options: "i" };

  if (queries?.category)
    formatedQueries.category = {
      $regex: queries.category,
      $options: "i",
    };
  let queryCommand = Product.find(formatedQueries);

  //Sorting

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Fields limiting

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Pagination

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  const count = await Product.countDocuments(queryCommand);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let products = await Product.find(queryCommand)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("category", "name");

  //Response
  sendResponse(
    res,
    200,
    true,
    { products, count, totalPages },
    null,
    "Get all products Successful"
  );
});

productController.getSingleProduct = catchAsync(async (req, res, next) => {
  // Get data from request
  const currentUserId = req.userId;
  const pId = req.params.id;
  // Process
  let product = await Product.findById(pId);
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
  const { pid } = req.params;
  if (req.body && req.body.name) req.body.slug = slugify(req.body.name);
  // Validation
  let product = await Product.findById(pid);
  if (!product)
    throw new AppError(400, "Product Not Found", "Update Product Error");

  // Process
  product = await Product.findByIdAndUpdate(pid, req.body, { new: true });
  //Response
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Update product Successful"
  );
});

productController.deleteProduct = catchAsync(async (req, res, next) => {
  // Get data from request
  const pId = req.params.id;
  // Process
  let product = await Product.findOneAndUpdate(
    { _id: pId },
    { isDeleted: true },
    { new: true }
  );
  if (!product)
    throw new AppError(
      400,
      "Product Not Found or User Not Authorized",
      "Delete Product Error"
    );
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

productController.ratingProduct = catchAsync(async (req, res, next) => {
  // Get data from request
  const currentUserId = req.userId;
  const { star, comment, pId } = req.body;
  console.log(req.body);
  if (!star || !pId) throw new AppError(400, "Missing inputs", "Rating Error");
  const ratingProduct = await Product.findById(pId);
  const alreadyRating = ratingProduct?.ratings?.find(
    (el) => el.postedBy.toString() === currentUserId
  );
  // console.log({ alreadyRating });
  if (alreadyRating) {
    // update star & comment
    await Product.updateOne(
      {
        ratings: { $elemMatch: alreadyRating },
      },
      { $set: { "ratings.$.star": star, "ratings.$.comment": comment } },
      { new: true }
    );
  } else {
    // add star & comment
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        $push: {
          ratings: { star, comment, postedBy: currentUserId },
        },
      },
      { new: true }
    );

    console.log(product);
  }

  // total Ratings
  const updatedProduct = await Product.findById(pId);
  const ratingCount = updatedProduct.ratings.length;
  const sumRatings = updatedProduct.ratings.reduce(
    (sum, el) => sum + +el.star,
    0
  );

  updatedProduct.totalRatings =
    Math.round((sumRatings * 10) / ratingCount) / 10;

  await updatedProduct.save();

  //Response
  return sendResponse(
    res,
    200,
    true,
    updatedProduct,
    null,
    "Rating product Successful"
  );
});

productController.uploadProductImages = catchAsync(async (req, res, next) => {
  const { pid } = req.params;
  if (!req.files)
    throw new AppError(401, "Missing Inputs", "Upload Product Images Error");
  const product = await Product.findByIdAndUpdate(
    pid,
    {
      $push: { images: { $each: req.files.map((el) => el.path) } },
    },
    { new: true }
  );
  uploader.array("images", 10);
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Upload Product Images Successfully"
  );
});
// backend goi api dung SDK cua cloudinary
//multer viet api cho client gui images multer nodejs upload images
// client dung api gui len ntn

module.exports = productController;
