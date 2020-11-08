const express = require("express");

const urlControllers = require("../controllers/url-controller");

const router = express.Router();

router.post("/increment", urlControllers.increaseCount);

router.get("/", urlControllers.getAll);

module.exports = router;
