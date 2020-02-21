const asyncHandler = require("../middleware/async");
const User = require("../model/User");
const ErrorResponse = require("../util/errorResponse");

//  @desc       Create new user
//  @route      POST /api/v1/auth/register
//  @access     Public
exports.createUser = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;
    const user = await User.create({ name, email, password, role });
    const token = user.getSignedJwtToken();
    res.status(201).json({
        status: true,
        token
        //data: user
    });
});

//  @desc       Login user
//  @route      POST /api/v1/auth/login
//  @access     Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(
            new ErrorResponse("Please provide email ans password", 400)
        );
    }

    //check user exist or not
    const user = await User.findOne({ email: email }).select("+password"); //password select false in model. + to add with model
    if (!user) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    const isPasswordMatch = await user.matchPassword(password); //true or false

    if (!isPasswordMatch) {
        return next(new ErrorResponse("Invalid credentials", 401));
    }

    sendTokenResponse(user, 200, res);
    /* const token = user.getSignedJwtToken();
    res.status(201).json({
        status: true,
        token
        //data: user
    }); */
});

//Get the token from the model and create cookie and send the response as cookie will send back
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(
            Date.now() +
                parseInt(process.env.JWT_COOKIE_EXPIRY) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === "production") {
        options.secure = true;
    }

    res.status(statusCode)
        .cookie("token", token, options)
        .json({ success: true, token });
};

//  @desc       Get current Loggedin user
//  @route      POST /api/v1/auth/me
//  @access     Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        succes: true,
        data: user
    });
});
