const bcrypt = require("bcryptjs");
const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/userModel");

const authController = {};

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  // Get data from request
  let { email, password } = req.body;

  // Validation
  const user = await User.findOne({ email }, "+password");
  if (!user || user.isDeleted)
    throw new AppError(400, "Invalid Credentials", "Login Error");

  // Process
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "Wrong password", "Login Error");

  const accessToken = await user.generateToken();

  //Response
  sendResponse(res, 200, true, { user, accessToken }, null, "Login Successful");
});

module.exports = authController;
