const Bootcamp = require("../model/Bootcamp");
const mongoose = require("mongoose");
const ErrorResponse = require("../util/errorResponse");
const asyncHandler = require("../middleware/async");
const geocoder = require("../util/geocoder");
const path = require("path");

//  @desc       Get all bootcamps
//  @route      GET /api/v1/bootcamps
//  @access     Public
exports.getBootcamps = async (req, res, next) => {
    try {
        //console.log(req.query);
        const reqQuery = { ...req.query };

        const removeFields = ["select", "sort", "page", "limit"];
        removeFields.forEach(param => delete reqQuery[param]);
        //console.log(reqQuery);

        let queryString = JSON.stringify(reqQuery);
        queryString = queryString.replace(
            /\b(gt|gte|lt|lte|in)\b/g,
            match => `$${match}`
        );

        let query = Bootcamp.find(JSON.parse(queryString)).populate("courses");

        if (req.query.select) {
            const selectFields = req.query.select.split(",").join(" ");
            query.select(selectFields);
        }

        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query.sort(sortBy);
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const totalCount = await Bootcamp.countDocuments(query);
        //console.log("Total records" + totalCount);

        query.skip(startIndex).limit(limit);
        const bootcamps = await query;

        let pagination = {};
        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            };
        }

        if (endIndex < totalCount) {
            pagination.next = {
                page: page + 1,
                limit: limit
            };
        }

        res.status(200).json({
            sucess: true,
            count: bootcamps.length,
            totalRecords: totalCount,
            pagination,
            data: bootcamps
        });
    } catch (error) {
        next(error);
    }
};

//  @desc       Get single bootcamp
//  @route      GET /api/v1/bootcamps/:id
//  @access     Public
exports.getBootcamp = async (req, res, next) => {
    try {
        validateId(req.params.id);
        const bootcamp = await Bootcamp.findById(req.params.id).populate(
            "courses"
        );
        if (!bootcamp) {
            throw new Error("No Data Found");
        }

        res.status(200).json({
            status: true,
            data: bootcamp
        });
    } catch (error) {
        next(error);
    }
};

//  @desc       Get single bootcamp
//  @route      POST /api/v1/bootcamps
//  @access     Public
exports.createBootcamp = async (req, res, next) => {
    try {
        req.body.user = req.user.id;
        const publishedBootcamp = await Bootcamp.find({ user: req.user.id });

        if (
            publishedBootcamp.length >=
                parseInt(
                    process.env.ALLOWED_BOOTCAMP_COUNT_FOR_OTHER_USER || 1
                ) &&
            !req.user.role !== "admin"
        ) {
            next(
                new ErrorResponse(
                    `The user with Id ${req.user.id} has already created ${publishedBootcamp.length} bootcamps`,
                    400
                )
            );
        }

        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            status: true,
            data: bootcamp
        });
    } catch (error) {
        next(error);
    }
};

//  @desc       Update bootcamp
//  @route      PUT /api/v1/bootcamps/:id
//  @access     Public
exports.updateBootcamp = async (req, res, next) => {
    try {
        validateId(req.params.id);
        const bootcamp = await Bootcamp.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, // return the updated object as response
                runValidators: true //mongoose validator explicitly setting
            }
        );
        if (!bootcamp) {
            throw new ErrorResponse("No Data Found", 500);
        }
        res.status(201).json({
            status: true,
            data: bootcamp
        });
    } catch (error) {
        next(error);
    }
};

//  @desc       delete the bootcamp
//  @route      DELETE /api/v1/bootcamps/:id
//  @access     Public
exports.deleteBootcamp = async (req, res, next) => {
    try {
        validateId(req.params.id);
        //const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id); - findByIdAndDelete will not trigger remove middleware in Bootcamp schema
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            throw new Error("No Data Found");
        }
        //added mto invoke remove middleware
        bootcamp.remove();

        res.status(200).json({
            status: true,
            data: bootcamp
        });
    } catch (error) {
        next(error);
    }
};

//  @desc       Get single bootcamp by radius distance
//  @route      GET /api/v1/bootcamps/radius/:zipcode/:distance
//  @access     Public
exports.getBootcampInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;
    console.log(zipcode);
    //Get lat , longitude from the zipcode
    const loc = await geocoder.geocode(zipcode);
    const latitude = loc[0].latitude;
    const longitude = loc[0].longitude;

    //Divide distance by radius of the earth
    //Earth radius = 3963 miles/ 6378 Km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: { $centerSphere: [[latitude, longitude], radius] }
        }
    });

    res.status(200).json({
        status: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

//  @desc       Upload bootcamp photo
//  @route      PUT /api/v1/bootcamps/:id/photo
//  @access     Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    validateId(req.params.id);
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        throw new ErrorResponse(`No Bootcamp Found for ${req.params.id}`, 404);
    }
    if (!req.files) {
        next(new ErrorResponse(`Please upload the file`, 400));
    }
    const file = req.files.file;
    if (!file.mimetype.startsWith("image")) {
        next(new ErrorResponse(`Please upload an image`, 400));
    }

    //Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(
            new ErrorResponse(
                `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`
            )
        );
    }

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            next(new ErrorResponse(`Problem with upload file`, 400));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {
            photo: `${process.env.FILE_UPLOAD_PATH}/${file.name}`
        });

        res.status(200).json({
            status: true,
            data: `${process.env.FILE_UPLOAD_PATH}/${file.name}`
        });
    });
});

validateId = id => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ErrorResponse("Invalid ID", 400);
    }
};
