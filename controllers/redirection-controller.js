const express = require("express");
const Url = require("../models/url-model");

let redirection = async (req, res) => {
  let url = process.env.BASE_URL + "/" + req.params.url;
  let existingUrl;

  try {
    existingUrl = await Url.findOne({ shortUrl: url });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server erro",
    });
  }

  if (!existingUrl) {
    return res.status(404).json({
      message: "Page doesnot exist",
    });
  }
  res.writeHead(301, {
    Location: existingUrl.oldUrl,
  });
  res.end();
};

exports.redirection = redirection;
