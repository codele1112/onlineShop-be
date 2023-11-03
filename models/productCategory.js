const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productCategorySchema = Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const productCategory = mongoose.model(
  "productCategory",
  productCategorySchema
);
module.exports = productCategory;
