const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    expire: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const couponCategory = mongoose.model("couponCategory", couponSchema);
module.exports = couponCategory;
