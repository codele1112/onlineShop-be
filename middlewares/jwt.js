const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const generateToken = async function (_id, role) {
  await jwt.sign({ _id, role }, JWT_SECRET_KEY, {
    expiresIn: "3d",
  });
};

const generateRefreshToken = async function (_id) {
  await jwt.sign({ _id }, JWT_SECRET_KEY, { expiresIn: "7d" });
};

module.exports = { generateToken, generateRefreshToken };
