const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const blogCategory = require("../models/blogCategory");

const blogCategoryController = {};
blogCategoryController.createCategory = catchAsync(async (req, res, next) => {
  const category = await blogCategory.create(req.body);
  return sendResponse(
    res,
    200,
    true,
    category,
    null,
    "Create blog category Successful"
  );
});

blogCategoryController.getCategory = catchAsync(async (req, res, next) => {
  const category = await blogCategory.find().select("name _id");
  return sendResponse(
    res,
    200,
    true,
    category,
    null,
    "Get all blog categories Successful"
  );
});

blogCategoryController.updateCategory = catchAsync(async (req, res, next) => {
  const { bcId } = req.params;

  const category = await blogCategory.findByIdAndUpdate(bcId, req.body, {
    new: true,
  });
  return sendResponse(
    res,
    200,
    true,
    category,
    null,
    "Updated blog category Successful"
  );
});
blogCategoryController.deleteCategory = catchAsync(async (req, res, next) => {
  const { bcId } = req.params;

  const category = await blogCategory.findByIdAndDelete(bcId);

  return sendResponse(
    res,
    200,
    true,
    category,
    null,
    "Deleted blog category Successful"
  );
});

module.exports = blogCategoryController;
