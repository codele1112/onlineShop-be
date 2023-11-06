const bcrypt = require("bcryptjs");
const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const generateAccessToken = require("../middlewares/jwt");

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
  const { _id } = req.user;
  // console.log(_id);

  // validation
  const user = await User.findById(_id).select("-refreshToken -role -password");
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

userController.refreshAccessToken = catchAsync(async (req, res, next) => {
  // get data
  const cookie = req.cookies;
  // console.log(cookie.refreshToken);
  let newAccessToken;
  if (!cookie && !cookie.refreshToken)
    throw new AppError(
      401,
      "No refresh token in cookie ",
      "Refresh Token Error"
    );
  // check token
  jwt.verify(
    cookie.refreshToken,
    process.env.JWT_SECRET_KEY,
    async (err, decode) => {
      // console.log("decode", decode);
      if (err)
        throw new AppError(401, "Invalid refesh token", "Refresh Token Error");

      // compare with token in db
      const response = await User.findOne({
        _id: decode._id,
        refreshToken: cookie.refreshToken,
      });
      // console.log("response", response);
      if (response)
        newAccessToken = generateAccessToken(response._id, response.role);
      console.log(newAccessToken);
      // await response.save();
      return sendResponse(
        res,
        200,
        true,
        { newAccessToken },
        null,
        "Get refresh token Successful"
      );
    }
  );
});

userController.getSingleUser = catchAsync(async (req, res, next) => {
  // get data
  const uid = req.params.userId;
  console.log("uid", uid);

  // process
  const user = await User.findById(uid);
  if (!user) throw new AppError(400, "User Not Found", "Get Single User Error");

  // // response
  return sendResponse(res, 200, true, user, null, "Get Single User Successful");
});

userController.updateUser = catchAsync(async (req, res, next) => {
  // Get data from request
  const { _id } = req.user;
  console.log(_id);
  const targetUserId = req.params.userId;
  // Validation
  if (_id !== targetUserId)
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
