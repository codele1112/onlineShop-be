const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogCategorySchema = Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const blogCategory = mongoose.model("blogCategory", blogCategorySchema);
module.exports = blogCategory;
