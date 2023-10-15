const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Please Enter product Name"],
      trim: true,
    },
    slug: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Please Enter product Description"],
    },
    price: {
      type: Number,
      required: [true, "Please Enter product Price"],
      maxLength: [8, "Price cannot exceed 8 characters"],
    },
    category: {
      type: String,
      enum: ["soap", "candle"],
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Please Enter product Quantity"],
    },
    image: { type: String, default: "" },
    shipping: { type: Boolean },
    isDeleted: { type: Boolean, default: false },
  },

  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
