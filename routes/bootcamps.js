const express = require("express");
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampInRadius,
    bootcampPhotoUpload
} = require("../controllers/bootcamps");

const Bootcamp = require("../model/Bootcamp");
const advancedResult = require("../middleware/advancedResults");

//include course router to route course related url
const courseRouter = require("./courses");
//route to reviews related URL
const reviewsRouter = require("./reviews");

//jwt security
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewsRouter);

router
    .route("/")
    .get(advancedResult(Bootcamp, "courses"), getBootcamps)
    .post(protect, authorize("publisher", "admin"), createBootcamp);

router
    .route("/:id")
    .get(getBootcamp)
    .put(protect, authorize("publisher", "admin"), updateBootcamp)
    .delete(protect, authorize("publisher", "admin"), deleteBootcamp);

router.route("/:id/photo").put(bootcampPhotoUpload);

router.route("/radius/:zipcode/:distance").get(getBootcampInRadius);
module.exports = router;
