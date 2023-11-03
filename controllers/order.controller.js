const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/user");
const Order = require("../models/order");

const orderController = {};
orderController.createOrder = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const userCart = await User.findById(currentUserId)
    .select("cart")
    .populate("cart.product", "name price");
  const products = userCart?.cart?.map((el) => ({
    product: el.product._id,
    quantity: el.quantity,
  }));
  let total = userCart?.cart?.reduce(
    (sum, el) => el.product.price * el.quantity + sum,
    0
  );
  const order = await Order.create({ products, total, orderBy: currentUserId });
  return sendResponse(res, 200, true, order, null, "Create order Successful");
});

orderController.getUserOrder = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const order = await Order.find({ orderBy: currentUserId });
  return sendResponse(
    res,
    200,
    true,
    order,
    null,
    "Get user orders Successful"
  );
});

orderController.getOrders = catchAsync(async (req, res, next) => {
  const currentUserId = req.userId;
  const order = await Order.find();
  return sendResponse(res, 200, true, order, null, "Get all orders Successful");
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
    "Update status order Successful"
  );
});

orderController.deleteOrder = catchAsync(async (req, res, next) => {});

module.exports = orderController;
