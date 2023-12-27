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
        quantity: Number,
        price: Number,
        name: String,
      },
    ],
    status: {
      type: String,
      default: "Cancelled",
      enum: ["Cancelled", "Succeed"],
    },
    total: Number,
    orderBy: { type: mongoose.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderShema);
module.exports = Order;
