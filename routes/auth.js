const express = require("express");

const {
    createUser,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updatePassword,
    logout
} = require("../controllers/auth");
const router = express.Router();
//jwt security
const { protect, authorize } = require("../middleware/auth");

router.route("/register").post(createUser);
router.route("/login").post(login);
router.route("/me").get(protect, getMe);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resetToken").put(resetPassword);
router
    .route("/updatepassword")
    .put(protect, authorize("publisher", "admin"), updatePassword);
router.route("/logout").get(logout);

module.exports = router;
