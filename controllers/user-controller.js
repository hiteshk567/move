const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const randomString = require("randomstring");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const shortid = require("shortid");
const validUrl = require("valid-url");

const User = require("../models/user-model");
const Url = require("../models/url-model");
const { base } = require("../models/user-model");

const getUrls = async (req, res) => {
  let id = req.params.id;
  let existingUser;
  try {
    existingUser = await User.findOne({ _id: mongoose.Types.ObjectId(id) });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
  if (!existingUser) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
  res.status(200).json({
    urls: existingUser.urls,
  });
};

const getInfo = async (req, res) => {
  let id = req.params.id;
  let existingUser;
  try {
    existingUser = await User.findOne(
      { _id: mongoose.Types.ObjectId(id) },
      "-password"
    );
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
    });
    throw new Error("internal error");
  }
  res.status(200).json({
    user: existingUser,
  });
};

const signup = async (req, res) => {
  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed, please try again",
    });
    throw new Error("Try later");
  }

  if (existingUser) {
    res.status(422).json({
      message: "User already exists, instead login",
    });
    throw new Error("User exists");
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    throw new Error("Something went wrong while pa");
  }

  const activationString = randomString.generate();

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    activationString,
    resetString: "",
    urls: [],
  });

  try {
    await newUser.save();
  } catch (error) {
    throw new Error("Something went wrong while saving");
  }

  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: `${process.env.EMAIL}`,
        pass: `${process.env.PASS}`,
      },
    });

    await User.findOneAndUpdate(
      {
        email: email,
      },
      {
        activationString: activationString,
      }
    );
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: "hiteshk567@gmail.com", // sender address
      to: `${email}`, // list of receivers
      subject: "ACTIVATE ACCOUNT", // Subject line
      text: activationString, // plain text body
      html: `<a href='https://tt-url.herokuapp.com/api/user/activate/${activationString}'>Click here to activate</a>`, // html body
    });
  } catch (error) {
    console.log(error);
  }

  res.status(200).json({
    message: "Check you email",
    userId: newUser._id,
    email: newUser.email,
  });
};

const activate = async (req, res) => {
  // let { activateString } = req.body;
  let activateString = req.params.activationString;

  let existingUser;
  try {
    existingUser = await User.findOne({ activationString: activateString });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong, try again",
    });
    throw new Error("Something went wrong");
  }
  console.log(activateString);
  if (!existingUser) {
    res.status(422).json({
      message: "Could not find the user",
    });
    throw new Error("User not in database");
  }

  if (activateString != existingUser.activationString) {
    res.status(422).json({
      message: "Code did not match",
    });
    throw new Error("User not in database");
  }

  existingUser.activationString = "";
  try {
    await existingUser.save();
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
    throw new Error("Something went wrong");
  }
  console.log("mahto");
  res.status(200).json({
    message: "Account activated successfully",
    activationString: existingUser.activateString,
  });
};

const change = async (req, res) => {
  let { email } = req.body;
  let existingUser;
  try {
    existingUser = await User.findOne({
      email: email,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
    throw new Error("internal server error 1");
  }
  if (existingUser) {
    try {
      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: `${process.env.EMAIL}`,
          pass: `${process.env.PASS}`,
        },
      });

      let randomGenString = randomString.generate();
      await User.findOneAndUpdate(
        {
          email: email,
        },
        {
          resetString: randomGenString,
        }
      );
      // send mail with defined transport object
      let info = await transporter.sendMail({
        from: "hiteshk567@gmail.com", // sender address
        to: `${email}`, // list of receivers
        subject: "RESET PASSWORD", // Subject line
        text: randomGenString, // plain text body
        html: `<p>Reset String : ${randomGenString}</p><a href='https://hiteshk567.github.io/resetPage/'>Click on the link</a>`, // html body
      });
      res.status(200).json({
        message: "Please check your mail",
      });
    } catch (error) {
      res.status(500).json({
        message: error,
      });
    }
  } else {
    res.status(400).json({
      message: "User not available",
    });
  }
};

const newPassword = async (req, res) => {
  let { resetString, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ resetString: resetString });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
    throw new Error("internal");
  }
  if (!existingUser) {
    res.status(422).json({
      message: "Invalid reset code",
    });
    throw new Error("reset code didn not match");
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
    });
    throw new Error("internal");
  }

  existingUser.password = hashedPassword;
  existingUser.resetString = "";

  await existingUser.save();

  res.status(200).json({
    message: "password changed successfully",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (error) {
    res.status(500).json({
      message: "Signup failed, please try again",
    });
    throw new Error("Try later");
  }

  if (!existingUser) {
    res.status(403).json({
      message: "Invalid credentials",
    });
    throw new Error("User exists");
  }

  if (existingUser.activationString) {
    res.status(403).json({
      message: "Please activate your email ID",
    });
    throw new Error("Not activated");
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    throw new Error("Could not log you in");
  }

  if (!isValidPassword) {
    res.status(403).json({
      message: "Invalid credentials",
    });
    throw new Error("Invalid credentials");
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    res.status(500).json({
      message: "Could not log you in",
    });
    throw new Error("internal error");
  }

  res.status(200).json({
    message: "Logged in successfully",
    name: existingUser.name,
    userId: existingUser._id,
    email: existingUser.email,
    token: token,
  });
};

let shortUrl = async (req, res) => {
  let id = req.params.id;
  let { oldUrl } = req.body;
  let baseUrl = process.env.BASE_URL;
  console.log(oldUrl);
  if (!validUrl.isUri(oldUrl)) {
    return res.status(401).json({
      message: "Invalid URL",
    });
  }

  const urlCode = shortid.generate();

  try {
    let url = await Url.findOne({ oldUrl: oldUrl });

    if (url) {
      return res.status(200).json({
        message: "Already present",
        url: url,
      });
    } else {
      const newUrl = baseUrl + "/" + urlCode;
      let user = await User.findOne({ _id: mongoose.Types.ObjectId(id) });
      url = new Url({
        oldUrl,
        shortUrl: newUrl,
        clicks: 0,
      });
      user.urls.push(url);
      await user.save();
    }

    await url.save();

    res.status(200).json({
      message: "Successfully created and saved",
      url: url,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

exports.signup = signup;
exports.login = login;
exports.activate = activate;
exports.newPassword = newPassword;
exports.change = change;
exports.getInfo = getInfo;
exports.shortUrl = shortUrl;
exports.getUrls = getUrls;
