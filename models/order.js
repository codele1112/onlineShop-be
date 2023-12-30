const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderShema = Schema(
  {
    products: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
        },
        name: String,
        quantity: Number,
        thumbnail: String,
        price: Number,
      },
    ],
    status: {
      type: String,
      default: "Cancelled",
      enum: ["Cancelled", "Succeed"],
    },
    total: Number,

    counpon: { type: mongoose.Types.ObjectId, ref: "Counpon" },
    orderBy: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderShema);
module.exports = Order;
