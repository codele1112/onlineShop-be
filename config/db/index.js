const mongoose = require("mongoose");

async function connect() {
  try {
    await mongoose.connect(process.env.MONG0DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connect Sucessfullly!");
  } catch (error) {
    console.log("Connect Failure!");
  }
}

module.exports = { connect };
