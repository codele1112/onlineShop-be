const express = require("express");
const router = express.Router();

// authApi
const authApi = require("./auth.api");
router.use("/auth", authApi);

module.exports = router;
