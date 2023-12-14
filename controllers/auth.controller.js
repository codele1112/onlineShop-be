const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/user");
const sendMail = require("../helpers/sendMail");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");

const authController = {};

// access token => xac thuc user, phan quyen user
// refresh token => cap moi access token

authController.loginWithEmail = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const response = await User.findOne({ email });
  if (response && (await response.isCorrectPassword(password))) {
    const { password, role, ...userData } = response.toObject();
    // create tokens
    const accessToken = generateAccessToken(response._id, role);
    const refreshToken = generateRefreshToken(response._id);
    console.log("refreshToken", refreshToken);
    // save refresh token in db
    await User.findByIdAndUpdate(response._id, { refreshToken }, { new: true });
    // save refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendResponse(
      res,
      200,
      true,
      { userData, accessToken },
      null,
      "Login Successful"
    );
  } else {
    throw new AppError(400, "Invalid Credentials", "Login Error");
  }
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
  const { email } = req.body;
  if (!email) throw new AppError(204, "Missing email", "Forgot Password Error");
  // kiem tra email co trong he thong ko
  const user = await User.findOne({ email });
  if (!user) throw new AppError(401, "User Not Found", "Forgot Password Error");

  // tao , random resetToken
  const resetToken = user.createPasswordChangedToken();
  await user.save();

  // gui pw moi qua mail
  const html = `Please confirm your email address by clicking the link below to change your password.
  This link will expire within 5 minutes from now. 
  <a href=${process.env.CLIENT_URL}/reset-password/${resetToken}>Click here!</a>`;

  const data = {
    email,
    html,
    subject: "FORGOT PASSWORD",
  };

  const rs = await sendMail(data);
  // gui res
  return sendResponse(res, 200, true, rs, null, " Email Sent Successfully");
});

authController.resetPassword = catchAsync(async (req, res, next) => {
  // kiem tra pw cu
  const { password, token } = req.body;
  // console.log("token", token);
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  // kiem tra user id
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  // console.log("user", user);
  if (!user) throw new AppError(500, "Invalid reset token");
  // const email = user.email;

  // cap nhat pw moi
  // tao pw moi
  // const newPassword = crypto.randomString(8);
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordChangedAt = Date.now();
  user.passwordResetExpires = undefined;
  // user.password = newPassword;
  await user.save();

  // gui pw moi qua mail
  // const html = `This is new password ${newPassword}`;

  // const data = {
  //   email,
  //   html,
  // };

  // const rs = await sendMail(data);

  return sendResponse(res, 200, true, user, null, "Reset password sucessfully");
});

module.exports = authController;
