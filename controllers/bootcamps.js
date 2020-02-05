const Bootcamp = require("../model/Bootcamp");
const mongoose = require("mongoose");
const ErrorResponse = require("../util/errorResponse");

//  @desc       Get all bootcamps
//  @route      GET /api/v1/bootcamps
//  @access     Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find();
        res.status(200).json({
            sucess: true,
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
        const bootcamp = await Bootcamp.findById(req.params.id);
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
        const bootcamp = await Bootcamp.create(req.body);
        res.status(200).json({
            status: true,
            data: bootcamp
        });
    } catch (error) {
        next(error);
    }
};

//  @desc       Get single bootcamp
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
        res.status(200).json({
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
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
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

validateId = id => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ErrorResponse("Invalid ID", 400);
    }
};
