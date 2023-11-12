const { catchAsync, AppError, sendResponse } = require("../helpers/utils");
const Coupon = require("../models/coupon");

const couponController = {};

couponController.createCoupon = catchAsync(async (req, res, next) => {
  const { expire } = req.body;
  const coupon = await Coupon.create({
    ...req.body,
    expire: Date.now() + expire * 24 * 60 * 60 * 1000,
  });
  return sendResponse(
    res,
    200,
    true,
    coupon,
    null,
    "Create new coupon Successfully"
  );
});

couponController.getCoupons = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.find().select("-createdAt -updatedAt");
  return sendResponse(
    res,
    200,
    true,
    coupon,
    null,
    "Get all coupons Successfully"
  );
});

couponController.updateCoupon = catchAsync(async (req, res, next) => {
  const { cid } = req.params;

  if (req.body.expire)
    req.body.expire = Date.now() + +req.body.expire * 24 * 60 * 60 * 1000;

  const coupon = await Coupon.findByIdAndUpdate(cid, req.body, {
    new: true,
  });

  return sendResponse(
    res,
    200,
    true,
    coupon,
    null,
    "Updated coupon Successfully"
  );
});

couponController.deleteCoupon = catchAsync(async (req, res, next) => {
  const { cid } = req.params;

  const coupon = await Coupon.findByIdAndDelete(cid);

  return sendResponse(
    res,
    200,
    true,
    coupon,
    null,
    "Deleted coupon Successfully"
  );
});

module.exports = couponController;
