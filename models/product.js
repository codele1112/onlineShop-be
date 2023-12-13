const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "productCategory",
    },
    quantity: {
      type: Number,
      default: 0,
    },
    sold: { type: Number, default: 0 },
    images: { type: Array },
    thumb: { type: String },
    ratings: [
      {
        star: { type: Number },
        postedBy: { type: mongoose.Types.ObjectId, ref: "User" },
        comment: { type: String },
      },
    ],
    totalRatings: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },

  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
