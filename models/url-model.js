const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  oldUrl: String,
  shortUrl: String,
  clicks: Number,
});

module.exports = mongoose.model("Url", urlSchema);
