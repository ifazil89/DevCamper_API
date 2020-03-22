const ErrorResponse = require("../util/errorResponse");
const errorHandler = (err, req, res, next) => {
    let error = err; //{ ...err }; //copy all the porperty frim err to error

    console.log("Error Log:");
    console.error(err);
    if (!err instanceof ErrorResponse) {
        error = new ErrorResponse(err.message, 500);
    } else if (err.code === 11000) {
        error = new ErrorResponse(
            "Duplicate field found for " + JSON.stringify(err.keyValue),
            400
        );
    } else if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    } else if (err.name === "CastError" && err.kind === "ObjectId") {
        error = new ErrorResponse(
            "Invalid Object Id " + err.value + " of " + err.path,
            400
        );
    } else if (err.name == "MongoError") {
        error = new ErrorResponse(`Error: ${err.errmsg}`, 500);
    } else if (err.name == "JsonWebTokenError") {
        error = new ErrorResponse(`Access Error: JWT Error`, 401);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Unknown error"
    });
};

module.exports = errorHandler;
