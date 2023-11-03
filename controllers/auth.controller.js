const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/user");
const sendMail = require("../helpers/sendMail");
const { generateToken, generateRefreshToken } = require("../middlewares/jwt");

const authController = {};

// access token => xac thuc user, phan quyen user
// refresh token => cap moi access token

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  // Get data from request
  const { email, password } = req.body;

  let currentUserId = req.userId;
  // console.log("currentUserId", currentUserId);

  // Validation
  let user = await User.findOne({ email }, "+password");
  if (!user || user.isDeleted)
    throw new AppError(400, "Invalid Credentials", "Login Error");
  if (!user.isCorrectPassword(password))
    throw new AppError(400, "Wrong password", "Login Error");

  // Process
  const { role } = user.toObject();
  const accessToken = generateToken(currentUserId, role);

  // create accessToken & refreshToken
  const refreshToken = generateRefreshToken(currentUserId);
  // console.log("refreshToken", refreshToken);

  // save token in db
  await User.findByIdAndUpdate(currentUserId, { refreshToken }, { new: true });

  // save refresh token in cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  //Response
  sendResponse(
    res,
    200,
    true,
    { user, accessToken, refreshToken },
    null,
    "Login Successful"
  );
});

authController.logout = catchAsync(async (req, res, next) => {
  const cookie = req.cookies;
  if (!cookie || !cookie.refreshToken)
    throw new AppError(401, "No refresh token in cookies", "Log out Error ");
  await User.findOneAndUpdate(
    { refreshToken: cookie.refreshToken },
    { refreshToken: "" },
    { new: true }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  return sendResponse(
    res,
    200,
    true,
    { status: "OK" },
    null,
    "Logout is done!"
  );
});

authController.forgotPassword = catchAsync(async (req, res, next) => {
  // kiem tra email user co duoc truyen len ko?
  const { email } = req.query;
  // kiem tra email co trong he thong ko
  const user = await User.findOne({ email });
  if (!user) throw new AppError(401, "User not found", "Forgot Password Error");

  // tao pw moi, random
  const resetToken = user.createPasswordChangedToken();
  await user.save();

  // gui pw moi qua mail
  const html = `Please confirm your email address by clicking the link below to change your password.
  This link will expire within 5 minutes from now. 
  <a href=${process.env.URL_SERVER}/api/auth/reset-password/${resetToken}>Click here!</a>`;

  const data = {
    email,
    html,
  };

  const rs = await sendMail(data);
  // gui res
  return sendResponse(res, 200, true, rs, null, " Email Sent Successfully");
});

authController.resetPassword = catchAsync(async (req, res, next) => {
  // kiem tra pw cu
  const { password, token } = req.body;
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // kiem tra user id
  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError(500, "Invalid reset token");
  // cap nhat pw moi
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangedAt = Date.now();
  user.passwordResetExpires = undefined;
  await user.save();

  return sendResponse(
    res,
    200,
    true,
    user,
    null,
    "Update password sucessfully"
  );
});

module.exports = authController;
