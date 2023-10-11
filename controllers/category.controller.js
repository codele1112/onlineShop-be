// const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
// const Category = require("../models/categoryModel");
// const slugify = require("slugify");

// const categoryController = {};
// categoryController.createCategory = catchAsync(async (req, res, next) => {
//   // get data
//   console.log("req.body", req.body);
//   const { name } = req.body;
//   // validation
//   if (!name)
//     throw new AppError(401, "Name is required", "Create Category Error");
//   // process
//   let existingCategory = await Category.findOne({ name });

//   if (existingCategory)
//     throw new AppError(
//       401,
//       "Category already existed!",
//       "Create Category Error"
//     );

//   let category = await Category.create({ name, slug: slugify(name) });
//   // response
//   return sendResponse(
//     res,
//     200,
//     true,
//     category,
//     null,
//     "Create new Category Successfull!"
//   );
// });

// module.exports = categoryController;
