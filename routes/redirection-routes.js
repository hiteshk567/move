const express = require("express");

const redirectionController = require("../controllers/redirection-controller");

const router = express.Router();

router.get("/:url", redirectionController.redirection);
// router.post(":/url", redirectionController.redirection);

module.exports = router;
