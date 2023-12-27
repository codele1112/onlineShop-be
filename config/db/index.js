const mongoose = require("mongoose");

async function connect() {
  try {
    console.log("uri", process.env.MONG0DB_URI);
    await mongoose.connect(process.env.MONG0DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connect Sucessfullly!");
  } catch (error) {
    console.log(error, " Error! Connect Failure!");
  }
}

module.exports = { connect };
