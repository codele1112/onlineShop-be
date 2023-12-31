const bcrypt = require("bcryptjs");
const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/user");
const Product = require("../models/product");
const jwt = require("jsonwebtoken");
const generateAccessToken = require("../middlewares/jwt");
const sendMail = require("../helpers/sendMail");
var uniqid = require("uniqid");
const moment = require("moment");

const userController = {};

userController.register = catchAsync(async (req, res, next) => {
  let { name, email, password, phone } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    throw new AppError(400, "User already existed!", "Registration error");
  } else {
    const token = uniqid();
    const emailEditted = btoa(email) + "@" + token;
    const newUser = await User.create({
      email: emailEditted,
      password,
      name,
      phone,
    });
    if (newUser) {
      const html = `<h2>Register Code: </h2><br/><blockquote>${token}</blockquote> `;
      await sendMail({ email, html, subject: "CONFIRM REGISTRATION" });
    }

    setTimeout(async () => {
      await User.deleteOne({ email: emailEditted });
    }, [300000]);
    return sendResponse(
      res,
      200,
      true,
      newUser,
      null,
      "Please check your email to active account."
    );
  }
});

userController.finalRegister = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const notActivedEmail = await User.find({ email: new RegExp(`${token}$`) });

  if (notActivedEmail) {
    notActivedEmail.email = atob(notActivedEmail.email.split("@")[0]);
    notActivedEmail.save();
  }
  return sendResponse(res, 200, true, notActivedEmail, "Register Successfully");
});

userController.getAllUsers = catchAsync(async (req, res, next) => {
  let queries = { ...req.query };
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  // Filtering
  if (queries?.name)
    formatedQueries.name = { $regex: queries.name, $options: "i" };

  if (req.query.q) {
    delete formatedQueries.q;
    formatedQueries["$or"] = [
      { name: { $regex: req.query.q, $options: "i" } },
      { email: { $regex: req.query.q, $options: "i" } },
    ];
  }

  console.log("formatQueries", formatedQueries);
  let queryCommand = User.find(formatedQueries);

  //Sorting

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    queryCommand = queryCommand.sort(sortBy);
  }

  // Fields limiting

  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    queryCommand = queryCommand.select(fields);
  }

  // Pagination

  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;

  const count = await User.countDocuments(queryCommand);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let users = await User.find(queryCommand)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  console.log("users", users);
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
  const { _id } = req.user;
  const user = await User.findById(_id)
    .select("-refreshToken -password  -passwordChangedAt")
    .populate({
      path: "cart",
      populate: {
        path: "product",
        select: "name thumb images price",
      },
    })
    .populate("wishlist", "name thumb images price");

  if (!user)
    throw new AppError(401, "User Not Found", "Get Current User Error!");

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

userController.updateCart = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const { pid, quantity = 1 } = req.body;

  let user = await User.findById(_id).select("cart");
  if (!user) throw new AppError(400, "User Not Found", "Update Cart Error");

  let product = await Product.findById(pid);

  if (!product)
    throw new AppError(400, "Product not found", "Update Cart Error");
  const { price, name, sold, stock } = product;

  const alreadyProduct = user?.cart?.find(
    (el) => el.product._id.toString() === pid
  );

  if (alreadyProduct) {
    const response = await User.updateOne(
      { cart: { $elemMatch: alreadyProduct } },
      {
        $set: {
          "cart.$.name": name,
          "cart.$.quantity": quantity,
          "cart.$.stock": +stock - +quantity,
          "cart.$.price": price,
          "cart.$.sold": sold + quantity,
        },
      },
      { new: true }
    );

    await user.save();

    product = await Product.findByIdAndUpdate(
      pid,
      {
        stock: +stock - +quantity,
        sold: sold + quantity,
      },
      { new: true }
    );
    await product.save();
    return sendResponse(
      res,
      200,
      true,
      { user, product },
      null,
      "Updated Cart Successfully"
    );
  } else {
    const response = await User.findByIdAndUpdate(
      _id,
      {
        $push: {
          cart: {
            product: pid,
            quantity,
            stock: +stock - +quantity,
            sold: +sold + +quantity,
            price,
            name,
          },
        },
      },
      { new: true }
    );
    await user.save();

    product = await Product.findByIdAndUpdate(
      pid,
      {
        stock: +stock - +quantity,

        sold: sold + quantity,
      },

      { new: true }
    );
    await product.save();

    return sendResponse(
      res,
      200,
      true,
      { user, product },
      null,
      "Updated Cart Successfully"
    );
  }
});

userController.removeProductInCart = catchAsync(async (req, res, next) => {
  // get data
  const { _id } = req.user;
  const { pid } = req.params;

  console.log("pid", pid);

  // process
  const user = await User.findById(_id).select("cart");
  if (!user) throw new AppError(400, "User Not Found", "Update Cart Error");
  const currentCart = user.cart;

  console.log("user.cart", user.cart);

  // console.log("user.cart.product", user.cart[0].product.toString());
  const alreadyProduct = user?.cart?.find(
    (el) => el.product?.toString() === pid
  );

  console.log("alreadyProduct", alreadyProduct);

  if (!alreadyProduct) {
    throw new AppError(
      400,
      "Product Not Found In Cart",
      "Remove Product In Cart Error"
    );
  }
  const filterCart = currentCart.filter((item) => {
    console.log("item", item["product"]._id.toString());
    return item["product"]._id.toString() !== pid;
  });
  console.log("filterCart", filterCart);

  const response = await User.findByIdAndUpdate(
    _id,
    {
      cart: filterCart,
    },
    { new: true }
  );
  return sendResponse(
    res,
    200,
    true,
    response,
    null,
    "Remove Product in Cart Successfully"
  );
});

userController.updateUser = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const { name, email, phone, address, avatar } = req.body;
  const data = { name, email, phone, address, avatar };

  if (req.file) data.avatar = req.file.path;
  if (!_id || Object.keys(req.body).length === 0)
    throw new AppError(400, "Missing Inputs", "Update User Error");
  let user = await User.findByIdAndUpdate(_id, data, { new: true });

  return sendResponse(res, 200, true, user, null, "Updated user Successfully");
});

userController.updateUserByAdmin = catchAsync(async (req, res, next) => {
  const { uid } = req.params;
  console.log("uid", uid);

  if (Object.keys(req.body).length === 0)
    throw new AppError(400, "Missing Inputs", "Update User Error");

  let user = await User.findByIdAndUpdate(uid, req.body, { new: true }).select(
    "-password -role -refreshToken"
  );

  return sendResponse(res, 200, true, user, null, "Updated");
});

userController.deleteUser = catchAsync(async (req, res, next) => {
  const { uid } = req.params;
  // console.log("uid", uid);

  let user = await User.findByIdAndDelete(uid);

  return sendResponse(res, 200, true, user, null, "Deleted user Successfully!");
});

userController.updateWishlist = catchAsync(async (req, res, next) => {
  const { pid } = req.params;
  const { _id } = req.user;
  const user = await User.findById(_id);
  const alreadyPid = user.wishlist?.find((el) => el.toString() === pid);
  if (alreadyPid) {
    const wishlist = await User.findByIdAndUpdate(
      _id,
      { $pull: { wishlist: pid } },
      { new: true }
    );
    return sendResponse(
      res,
      200,
      true,
      wishlist,
      null,
      "Updated wishlist Successfully"
    );
  } else {
    const wishlist = await User.findByIdAndUpdate(
      _id,
      { $push: { wishlist: pid } },
      { new: true }
    );
    return sendResponse(
      res,
      200,
      true,
      wishlist,
      null,
      "Updated wishlist Successfully"
    );
  }
});

userController.getUserStats = catchAsync(async (req, res, next) => {
  try {
    const users = await User.aggregate([
      {
        $match: { createdAt: { $lte: new Date() } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    sendResponse(res, 200, true, users, null, "Get user stats success");
  } catch (error) {
    next(error);
  }
});
module.exports = userController;
