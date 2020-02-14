const ErrorResponse = require("../util/errorResponse");
const Course = require("../model/Course");
const Bootcamp = require("../model/Bootcamp");
const asyncHandler = require("../middleware/async");

//  @desc   Get courses
//  @route  GET /api/v1/bootcamps/:bootcampId/courses
//  @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;
    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId }).populate({
            path: "bootcamp",
            select: "_id name description"
        });
    } else {
        query = Course.find().populate({
            path: "bootcamp",
            select: "_id name description"
        });
    }
    const courses = await query;
    res.status(200).json({
        status: true,
        count: courses.length,
        data: courses
    });
});

//  @desc   Get single courses
//  @route  GET /api/v1/courses/:id
//  @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    let query = Course.findById(req.params.id).populate({
        path: "bootcamp",
        select: "_id name description"
    });
    if (!query) {
        throw new ErrorResponse(
            `No course found for the id ${req.params.id}`,
            404
        );
    }
    const courses = await query;
    res.status(200).json({
        status: true,
        count: courses.length,
        data: courses
    });
});

//  @desc   Create courses
//  @route  POST /api/v1/bootcamps/:bootcampId/courses
//  @access Private
exports.createCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    const bootcamp = await Bootcamp.findOne({ _id: req.params.bootcampId });
    //console.log(bootcamp);
    if (!bootcamp) {
        throw new ErrorResponse(
            `No Bootcamp found for the bootcamp with id ${req.params.bootcampId}`
        );
    }
    const course = await Course.create(req.body);

    res.status(200).json({
        status: true,
        data: course
    });
});

//  @desc   Update course
//  @route  PUT /api/v1/courses/:id
//  @access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
    let course = await Course.findById(req.params.id);
    if (!course) {
        throw new ErrorResponse(
            `No course found for the id ${req.params.id}`,
            404
        );
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true, // return the updated object as response
        runValidators: true //mongoose validator explicitly setting
    }).populate({
        path: "bootcamp",
        select: "_id name description"
    });

    res.status(200).json({
        status: true,
        data: course
    });
});

//  @desc   Delete course
//  @route  DELETE /api/v1/courses/:id
//  @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    //console.log(course);
    if (!course) {
        return next(
            new ErrorResponse(
                `No course found for the id ${req.params.id}`,
                404
            )
        );
    }

    await course.remove();
    res.status(200).json({
        status: true,
        data: course
    });
});
