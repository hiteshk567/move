const express = require("express");

const userControllers = require("../controllers/user-controller");

const router = express.Router();

router.get("/url/:id", userControllers.getUrls);

router.get("/:id", userControllers.getInfo);

router.post("/signup", userControllers.signup);

// router.post("/activate", userControllers.activate);
router.get("/activate/:activationString", userControllers.activate);

router.post("/change", userControllers.change);

router.post("/newPassword", userControllers.newPassword);

router.post("/login", userControllers.login);

router.post("/:id", userControllers.shortUrl);

module.exports = router;
