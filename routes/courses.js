const express = require("express");
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} = require("../controllers/courses");

//jwt security
const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router
    .route("/")
    .get(getCourses)
    .post(protect, authorize("publisher", "admin"), createCourse);
router
    .route("/:id")
    .get(getCourse)
    .put(protect, authorize("publisher", "admin"), updateCourse)
    .delete(protect, authorize("publisher", "admin"), deleteCourse);

module.exports = router;
