const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const fs = require("fs");
const slugify = require("slugify");
const Product = require("../models/product");
const productCategory = require("../models/productCategory");

const productController = {};

productController.createNewProduct = catchAsync(async (req, res, next) => {
  let { name, description, category, price, stock } = req.body;
  const productCat = await productCategory.find({ name: category });
  category = productCat[0]._id;
  req.body.category = category;
  const thumb = req?.files?.thumb[0].path;
  const images = req?.files?.images.map((el) => el.path);
  if (thumb) req.body.thumb = thumb;
  if (images) req.body.images = images;
  let product = await Product.findOne({ name });
  if (product)
    throw new AppError(400, "Product already existed!", "Create Product Error");
  req.body.slug = slugify(name);
  product = await Product.create(req.body);
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Create new product Successfully"
  );
});

productController.getAllProducts = catchAsync(async (req, res, next) => {
  let queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  // format lai cac operators cho dung mongoose syntax
  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  if (queries?.name)
    formatedQueries.name = { $regex: queries.name, $options: "i" };

  if (queries?.category) {
    category =
      queries?.category.charAt(0).toUpperCase() + queries?.category.slice(1);
    const productCat = await productCategory.find({ name: category });
    category = productCat[0]._id;
    queries.category = category;
    formatedQueries.category = category;
  }

  let queryObject = {};
  if (queries?.q) {
    delete formatedQueries.q;
    queryObject = {
      $or: [{ name: { $regex: queries.q, $options: "i" } }],
    };
  }
  const qr = { ...formatedQueries, ...queryObject };
  let queryCommand = Product.find(qr);
  //Sorting

  if (req.query.sort) {
    console.log("req.query.sort", req.query.sort);
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
    // console.log("queryCommand", queryCommand);
  }

  // Fields limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Pagination

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  const count = await Product.find(qr).countDocuments();

  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);
  // console.log("queryCommand", queryCommand);

  let products = await Product.find(qr)
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
    "Get all products Successfully"
  );
});

productController.getSingleProduct = catchAsync(async (req, res, next) => {
  const { pid } = req.params;
  let product = await Product.findById(pid).populate("category", "name");
  if (!product)
    throw new AppError(400, "Product Not Found", "Get Single Product Error");
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Got Single Product Successfully"
  );
});

productController.updateProduct = catchAsync(async (req, res, next) => {
  const { pid } = req.params;
  const files = req?.files;
  let payload = req.body;
  console.log(payload);
  let { category } = payload;
  console.log("category", category);

  const productCat = await productCategory.find({ name: category });

  console.log("productCat", productCat);
  let id = productCat[0]._id;
  // gan name trong category thanh id
  payload.category = id;
  if (files?.thumb) payload.thumb = files?.thumb[0]?.path;
  if (files?.images) payload.images = files?.images?.map((el) => el.path);
  if (payload && payload.name) payload.slug = slugify(payload.name);
  let product = await Product.findById(pid);
  if (!product)
    throw new AppError(400, "Product Not Found", "Update Product Error");

  product = await Product.findByIdAndUpdate(pid, payload, { new: true });
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Updated product Successfully"
  );
});

productController.deleteProduct = catchAsync(async (req, res, next) => {
  const { pid } = req.params;
  let product = await Product.findByIdAndDelete(pid);
  if (!product)
    throw new AppError(
      400,
      "Product Not Found or User Not Authorized",
      "Delete Product Error"
    );
  return sendResponse(
    res,
    200,
    true,
    product,
    null,
    "Deleted product Successfully"
  );
});

productController.ratingProduct = catchAsync(async (req, res, next) => {
  const { star, comment, pid } = req.body;
  const { _id } = req.user;
  console.log(req.body);
  if (!star || !pid) throw new AppError(400, "Missing inputs", "Rating Error");
  const ratingProduct = await Product.findById(pid);
  const alreadyRating = ratingProduct?.ratings?.find(
    (el) => el.postedBy.toString() === _id
  );
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
      pid,
      {
        $push: {
          ratings: { star, comment, postedBy: _id },
        },
      },
      { new: true }
    );

    console.log(product);
  }

  // total Ratings
  const updatedProduct = await Product.findById(pid);
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
    "Rating product Successfully"
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
    "Uploaded Product Images Successfully"
  );
});
// backend goi api dung SDK cua cloudinary
//multer viet api cho client gui images multer nodejs upload images
// client dung api gui len ntn

module.exports = productController;
