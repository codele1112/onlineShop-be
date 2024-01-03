const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/user");
const Order = require("../models/order");
const Product = require("../models/product");

const orderController = {};
orderController.createOrder = catchAsync(async (req, res, next) => {
  const { _id } = req.user;

  const { products, address, total, status, createdAt } = req.body;

  if (address) {
    await User.findByIdAndUpdate(
      _id,
      { address, status: "Succeed", cart: [] },
      { new: true }
    );
  }

  const data = { products, total, orderBy: _id, createdAt };
  if (status) data.status = status;
  const order = await Order.create(data);

  return sendResponse(res, 200, true, order, null, "Create order Successfully");
});

orderController.getUserOrder = catchAsync(async (req, res, next) => {
  const queries = { ...req.query };
  const { _id } = req.user;
  const excludeFields = ["limit", "sort", "page", "fields"];
  excludeFields.forEach((el) => delete queries[el]);

  let queryString = JSON.stringify(queries);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte)\b/g,
    (macthedEl) => `$${macthedEl}`
  );
  const formatedQueries = JSON.parse(queryString);

  const q = { ...formatedQueries, orderBy: _id };
  let queryCommand = Order.find(q);

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

  const count = await Order.countDocuments(queryCommand);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);
  // console.log("queryCommand", queryCommand);
  let orders = await Order.find(queryCommand)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("orderBy", "name");

  // const order = await Order.find({ orderBy: _id });

  return sendResponse(
    res,
    200,
    true,
    { orders, count, totalPages },
    null,
    "Get user's orders Successfully"
  );
});

orderController.getOrders = catchAsync(async (req, res, next) => {
  const order = await Order.find();
  return sendResponse(
    res,
    200,
    true,
    order,
    null,
    "Get all orders Successfully"
  );
});

orderController.updateStatusOrder = catchAsync(async (req, res, next) => {
  const { oid } = req.params;
  const { status } = req.body;
  if (!status)
    throw new AppError(400, "Missing status", "Update Status Order Error");
  const order = await Order.findByIdAndUpdate(oid, { status }, { new: true });

  return sendResponse(
    res,
    200,
    true,
    order,
    null,
    "Update status order Successfully"
  );
});

// orderController.deleteOrder = catchAsync(async (req, res, next) => {});

orderController.getOrderStats = catchAsync(async (req, res, next) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: { createdAt: { $lte: new Date() } },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$total",
        },
      },
      {
        $group: {
          _id: "$month",
          totalOrders: { $sum: 1 },
          income: { $sum: "$sales" },
        },
      },
    ]).sort({ _id: "$month" });
    sendResponse(res, 200, true, orders, null, "Get orders stats successfully");
  } catch (error) {
    next(error);
  }
});

module.exports = orderController;
