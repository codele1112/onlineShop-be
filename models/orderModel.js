const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderShema = Schema({
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  email: {
    type: String,
    required: true,
  },
  phone: { type: String, required: true },
  address: {
    type: String,
    required: true,
  },
  city: { type: String, required: true },
  country: { type: String, required: true },
  orderItems: [
    {
      item: {
        type: mongoose.Schema.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["Paid", "Unpaid"],
    required: false,
    default: "Unpaid",
  },
});

const Order = mongoose.model("Order", orderShema);
module.exports = Order;

/**
Order Example:

{
    "Cart" : [
        {
            "quantity": 3,
            "product" : "5fcfc406ae79b0a6a90d2585"
        },
        {
            "quantity": 2,
            "product" : "5fd293c7d3abe7295b1403c4"
        }
    ],
   
    "userID": "5fd51bc7e39ba856244a3b44"
}

 */
