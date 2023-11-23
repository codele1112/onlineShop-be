const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const User = require("../models/user");
const Order = require("../models/order");

const orderController = {};
orderController.createOrder = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const { products, total, address, status } = req.body;

  if (address) {
    await User.findByIdAndUpdate(
      _id,
      { address, status: "Succeed", cart: [] },
      { new: true }
    );
  }

  const data = { products, total, orderBy: _id };
  if (status) data.status = status;
  const order = await Order.create(data);
  return sendResponse(res, 200, true, order, null, "Create order Successful");
});

orderController.getUserOrder = catchAsync(async (req, res, next) => {
  const { _id } = req.user;
  const order = await Order.find({ orderBy: _id });
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
