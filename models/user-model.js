const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  activationString: String,
  resetString: String,
  urls: Array,
});

module.exports = mongoose.model("User", userSchema);
