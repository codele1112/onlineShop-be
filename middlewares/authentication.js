const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/user");

authentication = {};
authentication.loginRequired = (req, res, next) => {
  try {
    // headers: {authorization: Bearer token}
    const tokenString = req.headers.authorization;
    console.log("tokenString", tokenString);

    if (!tokenString)
      throw new AppError(401, "Login Required", "Authentication Error");

    // console.log("tokenString", tokenString);
    const token = tokenString.replace("Bearer ", "");
    // console.log("token", token);

    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if (err) {
        if (err.name === "TokenExpriredError") {
          throw new AppError(401, "Token Exprired", "Authentication Error");
        } else {
          throw new AppError(401, "Token is invalid", "Authentication Error");
        }
      }
      console.log("payload", payload);

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
