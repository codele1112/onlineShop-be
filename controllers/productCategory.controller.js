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

productCategoryController.getCategories = catchAsync(async (req, res, next) => {
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
    const { cpid } = req.params;

    const category = await Category.findByIdAndUpdate(pcid, req.body, {
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
    const { pcid } = req.params;

    const category = await Category.findByIdAndDelete(pcid);

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
