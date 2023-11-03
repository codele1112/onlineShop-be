const bcrypt = require("bcryptjs");
const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const { cookie } = require("express-validator");

const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  // Get data from request
  let { name, email, password, role, phone } = req.body;
  // Validation
  let user = await User.findOne({ email });
  if (user)
    throw new AppError(400, "User already existed!", "Registration error");
  // Process
  const newUser = await User.create(req.body);
  await newUser.save();
  //Response
  sendResponse(res, 200, true, { newUser }, null, "Create user Successful");
});

userController.getAllUsers = catchAsync(async (req, res, next) => {
  // Get data

  let { page, limit, ...filter } = { ...req.query };
  // Validation
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  const filterConditions = [{ isDeleted: false }];

  if (filter.name) {
    filterConditions.push({
      name: { $regex: filter.name, $options: "i" },
    });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await User.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  // Process
  let users = await User.find(filterCriteria)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
  // Response

  sendResponse(
    res,
    200,
    true,
    { users, totalPages, count },
    null,
    "Get all users Successful"
  );
});

userController.getCurrentUser = catchAsync(async (req, res, next) => {
  // get data
  const currentId = req.userId;

  // validation
  const user = await User.findById(currentId);
  if (!user)
    throw new AppError(401, "User Not Found", "Get Current User Error!");

  // response

  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Get Current User Successful"
  );
});

userController.getSingleUser = catchAsync(async (req, res, next) => {
  // get data
  const userId = req.params.userId;
  // process
  const user = await User.findById(userId);
  if (!user) throw new AppError(400, "User Not Found", "Get Single User Error");

  // response
  return sendResponse(res, 200, true, user, null, "Get Single User Successful");
});

userController.updateUser = catchAsync(async (req, res, next) => {
  // Get data from request
  const currentUserId = req.userId;
  const targetUserId = req.params.userId;
  // Validation
  if (currentUserId !== targetUserId)
    throw new AppError(400, "Permission Required", "Update User Error");
  let user = await User.findById(targetUserId);
  if (!user) throw new AppError(400, "User Not Found", "Update User Error");

  // Process
  const allows = ["name", "phone", "address", "city", "country", "avatarUrl"];

  allows.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });
  await user.save();
  //Response
  return sendResponse(res, 200, true, user, null, "Update user Successful");
});

module.exports = userController;
