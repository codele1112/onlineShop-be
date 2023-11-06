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
    address: { type: mongoose.Types.ObjectId, ref: "Address" },
    wishlist: { type: mongoose.Types.ObjectId, ref: "Product" },
    cart: { type: Array, default: [] },
    isBlocked: { type: Boolean, default: false },
    refreshToken: { type: String },
    passwordChangedAt: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: String },
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
    return await bcrypt.compare(password, this.password);
  },
  createPasswordChangedToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log("resetToken", resetToken);
    this.passwordResetToken = resetToken;
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    console.log(resetToken);
    console.log(this.passwordResetToken);
    return resetToken;
  },
};

const User = mongoose.model("User", userSchema);
module.exports = User;
