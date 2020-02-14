const ErrorResponse = require("../util/errorResponse");
const errorHandler = (err, req, res, next) => {
    let error = err; //{ ...err }; //copy all the porperty frim err to error

    if (!err instanceof ErrorResponse) {
        error = new ErrorResponse(err.message, 500);
    }
    if (err.code === 11000) {
        error = new ErrorResponse(
            "Duplicate field found for " + JSON.stringify(err.keyValue),
            400
        );
    }
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    if (err.name === "CastError" && err.kind === "ObjectId") {
        error = new ErrorResponse(
            "Invalid Object Id " + err.value + " of " + err.path,
            400
        );
    }
    res.status(500).json({
        success: false,
        message: error.message
    });
};

module.exports = errorHandler;
