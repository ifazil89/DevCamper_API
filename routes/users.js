const express = require("express");
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/users");
const router = express.Router();
//jwt security
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const User = require("../model/User");

router.use(protect);
router.use(authorize("admin"));

router
    .route("/")
    .get(advancedResults(User), getUsers)
    .post(createUser);
router
    .route("/:id")
    .get(getUser)

    .put(updateUser)
    .delete(deleteUser);

module.exports = router;
