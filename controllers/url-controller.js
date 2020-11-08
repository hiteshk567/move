const Url = require("../models/url-model");

let increaseCount = async (req, res) => {
  let url = req.body.url;
  // console.log(url);
  let existingUrl;
  try {
    existingUrl = await Url.findOne({
      shortUrl: url,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
  if (!existingUrl) {
    return res.status(500).json({
      message: "Could not find the url",
    });
  }
  existingUrl.clicks += 1;
  await existingUrl.save();
  // console.log(existingUrl);
  res.status(200).json({
    message: "Count increased",
  });
};

let getAll = async (req, res) => {
  try {
    let urls = await Url.find({});
    res.status(200).json({
      urls: urls,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
console.log("kumar");
let getOldUrl = async (req, res) => {
  let shortUrl = req.params.url;
  let oldUrl;
  try {
    oldUrl = await Url.findOne({ shortUrl: shortUrl });
  } catch (error) {
    return res.status(500).json({
      message: "interal error",
    });
  }
  if (!oldUrl) {
    return res.status(404).json({
      message: "Couldnot find the link",
    });
  }
  res.status(200).json({
    oldUrl: oldUrl,
  });
};

exports.increaseCount = increaseCount;
exports.getAll = getAll;
exports.getOldUrl = getOldUrl;
