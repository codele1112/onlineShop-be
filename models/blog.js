const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: { type: String, required: true },
    category: { type: String, required: true },
    numberOfViews: { type: Number, default: 0 },
    isLiked: { type: Boolean, default: false },
    isDisliked: { type: String, default: 0 },
    like: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    dislike: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    images: {
      type: String,
      default:
        "https://img.freepik.com/photos-premium/vue-du-bureau-cafe-ordinateur-portable_325774-1964.jpg",
    },
    author: { type: String, default: "admin" },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
