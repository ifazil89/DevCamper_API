const express = require("express");

const { createUser, login, getMe } = require("../controllers/auth");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(createUser);
router.route("/login").post(login);
router.route("/me").get(protect, getMe);

module.exports = router;
