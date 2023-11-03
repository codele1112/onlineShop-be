const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageShema = Schema({
  productId: { type: mongoose.Schema.ObjectId, ref: "Product" },
  name: { type: String },
  url: {
    type: String,
    required: true,
  },
});

const Image = mongoose.model("Image", imageShema);
module.exports = Image;
