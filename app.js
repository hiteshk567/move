const express = require("express");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const userRoutes = require("./routes/user-routes");
const urlRoutes = require("./routes/api-routes");
const redirectionRoutes = require("./routes/redirection-routes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(
  `mongodb+srv://hiteshk567:${process.env.DB_PASSWORD}@cluster0.h7etb.mongodb.net/urlshortener?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
  }
);

app.use("/api/user", userRoutes);
app.use("/api/url", urlRoutes);
app.use("/rd", redirectionRoutes);

// app.post("/register", async (req, res) => {
//   let { name, email, passowrd } = req.body;
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
