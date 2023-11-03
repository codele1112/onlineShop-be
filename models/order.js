const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderShema = Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  status: {
    type: String,
    default: "Processing",
    enum: ["Cancelled", "Processing", "Success"],
  },
  total: { type: Number },
  orderBy: { type: mongoose.Types.ObjectId, ref: "User" },
  paymentIntent: {
    type: String,
  },
});

const Order = mongoose.model("Order", orderShema);
module.exports = Order;
