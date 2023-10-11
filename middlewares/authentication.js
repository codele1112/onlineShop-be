const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/userModel");

authentication = {};
authentication.loginRequired = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString)
      throw new AppError(401, "Login Required", "Authentication Error");

    const token = tokenString.replace("Bearer ", "");

    console.log(token);
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpriredError") {
          throw new AppError(401, "Token Exprired", "Authentication Error");
        } else {
          throw new AppError(401, "Token is invalid", "Authentication Error");
        }
      }

      req.userId = payload._id;
    });

    next();
  } catch (error) {
    next(error);
  }
};

authentication.isAdmin = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  // console.log(currentUserId);
  const adminUser = await User.findById(currentUserId);
  if (adminUser.role !== "admin") {
    throw new AppError("UnAuthorized Access");
  } else {
    next();
  }
});

module.exports = authentication;
