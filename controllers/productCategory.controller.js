const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Category = require("../models/productCategory");

const productCategoryController = {};
productCategoryController.createCategory = catchAsync(
  async (req, res, next) => {
    const category = await Category.create(req.body);
    return sendResponse(
      res,
      200,
      true,
      category,
      null,
      "Create category Successful"
    );
  }
);

productCategoryController.getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.find().select("name _id");
  return sendResponse(
    res,
    200,
    true,
    category,
    null,
    "Get all categories Successful"
  );
});

productCategoryController.updateCategory = catchAsync(
  async (req, res, next) => {
    const { cId } = req.params;

    const category = await Category.findByIdAndUpdate(cId, req.body, {
      new: true,
    });
    return sendResponse(
      res,
      200,
      true,
      category,
      null,
      "Updated category Successful"
    );
  }
);
productCategoryController.deleteCategory = catchAsync(
  async (req, res, next) => {
    const { cId } = req.params;

    const category = await Category.findByIdAndDelete(cId);

    return sendResponse(
      res,
      200,
      true,
      category,
      null,
      "Deleted category Successful"
    );
  }
);

module.exports = productCategoryController;
