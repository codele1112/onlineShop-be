const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { AppError, catchAsync } = require("../helpers/utils");
const User = require("../models/user");

authentication = {};
authentication.loginRequired = (req, res, next) => {
  // headers: {authorization: Bearer token}

  if (req?.headers?.authorization?.startsWith("Bearer")) {
    const token = req.headers.authorization.split(" ")[1];
    // console.log("token", token);

    jwt.verify(token, JWT_SECRET_KEY, (err, decode) => {
      if (err) {
        if (err.name === "TokenExpriredError") {
          throw new AppError(401, "Token Exprired", "Authentication Error");
        } else {
          throw new AppError(401, "Token is invalid", "Authentication Error");
        }
      }
      // console.log("decode", decode);

      req.user = decode;

      next();
    });
  } else {
    throw new AppError(401, "Token required.", "Authentication Error");
  }
};

authentication.isAdmin = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  // console.log(currentUserId);
  const adminUser = await User.findById(_id);
  if (adminUser.role !== "admin") {
    throw new AppError("UnAuthorized Access");
  } else {
    next();
  }
});

module.exports = authentication;
