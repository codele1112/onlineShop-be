const bcrypt = require("bcryptjs/dist/bcrypt");
const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/User");

const authController = {};

authController.register = catchAsync(async (req, res, next) => {
  // Get data from request
  let { name, email, password, phone, address } = req.body;

  // Validation
  let user = await User.findOne({ email });
  if (user)
    throw new AppError(400, "User already existed!", "Registration error");
  // Process
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);
  user = await User.create({ name, email, password, phone, address });

  const accessToken = await user.generateToken();
  //Response
  sendResponse(
    res,
    200,
    true,
    { user, accessToken },
    null,
    "Create user Successful"
  );
});
authController.loginWithEmail = catchAsync(async (req, res, next) => {
  // Get data from request
  let { email, password } = req.body;

  // Validation
  const user = await User.findOne({ email }, "+password");
  if (!user) throw new AppError(400, "Invalid Credentials", "Login Error");

  // Process
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError(400, "Wrong password", "Login Error");

  const accessToken = await user.generateToken();

  //Response
  sendResponse(res, 200, true, { user, accessToken }, null, "Login Successful");
});

module.exports = authController;
