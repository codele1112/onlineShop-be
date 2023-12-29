require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");
const { sendResponse } = require("./helpers/utils");

var indexRouter = require("./routes/index");
const db = require("./config/db");

var app = express();
// connect to db

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", indexRouter);

/* Initialize Error Handling */

app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.statusCode = 404;
  next();
});

app.use((err, req, res, next) => {
  console.log("ERROR", err);
  if (err.isOperational) {
    return sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      { message: err.message },
      err.errorType
    );
  } else {
    return sendResponse(
      res,
      err.statusCode ? err.statusCode : 500,
      false,
      null,
      { message: err.message },
      "Internal Server Error"
    );
  }
});
db.connect();

module.exports = app;
