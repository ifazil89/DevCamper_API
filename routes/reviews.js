const express = require("express");
const advancedResults = require("../middleware/advancedResults");
const Review = require("../model/Review");
const {
    getReviews,
    getReview,
    addReview,
    updateReview,
    deleteReview
} = require("../controllers/reviews");
//jwt security
const { protect, authorize } = require("../middleware/auth");
const router = express.Router({ mergeParams: true });

router
    .route("/")
    .get(advancedResults(Review), getReviews)
    .post(protect, authorize("user"), addReview);
router
    .route("/:id")
    .get(getReview)
    .put(protect, authorize("user", "admin"), updateReview)
    .delete(protect, authorize("user", "admin"), updateReview);

module.exports = router;
