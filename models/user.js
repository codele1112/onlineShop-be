const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const userSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: { type: String, default: "" },
    address: String,
    wishlist: { type: mongoose.Types.ObjectId, ref: "Product" },
    cart: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number,
      },
    ],
    isBlocked: { type: Boolean, default: false },
    refreshToken: { type: String },
    passwordChangedAt: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: String },
    registerToken: { type: String },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const user = this._doc;
  delete user.password;
  delete user.isDeleted;
  return user;
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods = {
  isCorrectPassword: async function (password) {
    // console.log("iscorrectpw", password, this.password);

    return await bcrypt.compare(password, this.password);
  },

  createPasswordChangedToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    // console.log("resetToken", resetToken);
    this.passwordResetToken = resetToken;
    this.passwordResetExpires = Date.now() + 5 * 60 * 1000;
    // console.log(resetToken);
    // console.log(this.passwordResetToken);
    return resetToken;
  },
};

const User = mongoose.model("User", userSchema);
module.exports = User;
