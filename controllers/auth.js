const asyncHandler = require("../middleware/async");
const User = require("../model/User");
const ErrorResponse = require("../util/errorResponse");
const sendEmail = require("../util/sendEmail");
const crypto = require("crypto");

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

//  @desc   Forgot password
//  @route  POST /api/v1/auth/forgotpassword
//  @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new ErrorResponse(
                `No user found for the email ${req.body.email}`,
                404
            )
        );
    }
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get(
        "host"
    )}/api/v1/auth/resetpassword/${resetToken}`;
    console.log(resetUrl);
    await sendEmail({
        email: req.body.email,
        subject: "Forgot Password",
        message: `Please <a href="${resetUrl}"> Click Here</a> the below link to reset the password.
                    <br><br> Copy the below URL in PUT Request.<br>${resetUrl}`
    });

    res.status(200).json({ success: true, data: user });
});

//  @desc   Reset password
//  @route  PUT /api/v1/auth/resetpassword/:resetToken
//  @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.resetToken)
        .digest("hex");
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpiry: { $gt: Date.now() }
    });
    if (!user) {
        return next(new ErrorResponse(`Invallid Token.`, 404));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
    //res.status(200).json({ success: true, data: user });
});

//  @desc   Update Current Password
//  @route  /api/v1/auth/updatepassword
//  @access Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("+password");
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse(`Cuurent password is not matching`, 401));
    }
    user.password = req.body.newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
});

//  @desc       Log out user
//  @route      GET /api/v1/auth/logout
//  @access     Public
exports.logout = asyncHandler(async (req, res, next) => {
    res.cookie("token", "none", { expires: new Date(Date.now() + 10 * 1000) });
    res.status(200).json({
        status: true,
        data: {}
    });
});
