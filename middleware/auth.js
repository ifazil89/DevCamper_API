const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../util/errorResponse");
const User = require("../model/User");

//Add security to routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    //CHeck if token is avaialble
    if (!token) {
        next(new ErrorResponse("Not authorized to access", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        //console.log(decoded);

        req.user = await User.findById(decoded.id);
        if (!req.user) {
            next(new ErrorResponse("Not authorized to access", 401));
        }
        next();
    } catch (error) {
        console.log("Authentication  Error");
        //console.error(error);
        throw error;
    }
});

//authroization
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(
                    `User with role ${req.user.role} has not authorized`,
                    403
                )
            );
        }
        next();
    };
};
