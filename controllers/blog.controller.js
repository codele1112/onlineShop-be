const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Blog = require("../models/blog");

const blogController = {};
blogController.createBlog = catchAsync(async (req, res, next) => {
  const { name, description, category } = req.body;
  if (!name || !description || !category)
    throw new AppError(401, "Missing inputs", "Create Blog Error");
  const blog = await Blog.create(req.body);
  return sendResponse(
    res,
    200,
    true,
    blog,
    null,
    "Create blog category Successful"
  );
});

blogController.getBlogs = catchAsync(async (req, res, next) => {
  const blog = await Blog.find();
  return sendResponse(res, 200, true, blog, null, "Get all blogs Successful");
});

blogController.getSingleBlog = catchAsync(async (req, res, next) => {
  const { bid } = req.params;
  const blog = await Blog.findById(bid)
    .populate("like", "name")
    .populate("dislike", "name");
  return sendResponse(res, 200, true, blog, null, "Get all blogs Successful");
});
blogController.updateBlog = catchAsync(async (req, res, next) => {
  const { bId } = req.params;
  console.log(bId);

  if (Object.keys(req.body).length === 0)
    throw new AppError(401, "Missing inputs", "Update Blog Error");

  const blog = await Blog.findByIdAndUpdate(bId, req.body, {
    new: true,
  });

  return sendResponse(
    res,
    200,
    true,
    { blog },
    null,
    "Updated blog Successful"
  );
});

blogController.likeBlog = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  // console.log("currentId", currentUserId);

  const { bid } = req.params;
  // console.log("_id", _id);

  if (!bid) throw new AppError(401, "Missing inputs", "Like Blog Error");
  const blog = await Blog.find(bid);
  const alreadyDisliked = blog?.dislike?.find(
    (el) => el.toString() === currentUserId
  );

  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { dislike: currentUserId } },
      { new: true }
    );
    return sendResponse(
      res,
      200,
      true,
      blog,
      null,
      "Update like or dislike Successful"
    );
  }

  const isLiked = blog?.like?.find((el) => el.toString() === currentUserId);

  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { like: currentUserId } },
      { new: true }
    );
    return sendResponse(
      res,
      200,
      true,
      blog,
      null,
      "Update like or dislike Successful"
    );
  } else {
    const blog = await Blog.findByIdAndUpdate(
      bid,
      { $push: { like: currentUserId } },
      { new: true }
    );
    return sendResponse(
      res,
      200,
      true,
      blog,
      null,
      "Update like or dislike Successful"
    );
  }
});

blogController.dislikeBlog = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  // console.log("currentId", currentUserId);

  const { bid } = req.params;
  // console.log("_id", _id);

  if (!bid) throw new AppError(401, "Missing inputs", "Like Blog Error");
  const blog = await Blog.find(bid);
  const alreadyLiked = blog?.like?.find(
    (el) => el.toString() === currentUserId
  );

  if (alreadyLiked) {
    const blog = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { like: currentUserId } },
      { new: true }
    );
    return sendResponse(
      res,
      200,
      true,
      blog,
      null,
      "Update like or dislike Successful"
    );
  }

  const isDisliked = blog?.dislike?.find(
    (el) => el.toString() === currentUserId
  );

  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(
      bid,
      { $pull: { dislike: currentUserId } },
      { new: true }
    );
    return sendResponse(
      res,
      200,
      true,
      blog,
      null,
      "Update like or dislike Successful"
    );
  } else {
    const blog = await Blog.findByIdAndUpdate(
      bid,
      { $push: { dislike: currentUserId } },
      { new: true }
    );
    return sendResponse(
      res,
      200,
      true,
      blog,
      null,
      "Update like or dislike Successful"
    );
  }
});

blogController.deleteBlog = catchAsync(async (req, res, next) => {
  // Get data from request
  const { bid } = req.params;
  // Process
  let blog = await Blog.findOneAndUpdate(
    { _id: bid },
    { isDeleted: true },
    { new: true }
  );
  if (!blog)
    throw new AppError(
      400,
      "Blog Not Found or User Not Authorized",
      "Delete Blog Error"
    );
  //Response
  return sendResponse(res, 200, true, blog, null, "Delete Blog Successful");
});

blogController.uploadImageBlog = catchAsync(async (req, res, next) => {
  const { bid } = req.params;
  if (!req.file)
    throw new AppError(401, "Missing Inputs", "Upaload Blog Images Error");
  const blog = await Blog.findByIdAndUpdate(
    bid,
    {
      images: req.file.path,
    },
    { new: true }
  );
  return sendResponse(
    res,
    200,
    true,
    blog,
    null,
    "Upload Blog Image Successful"
  );
});
module.exports = blogController;
