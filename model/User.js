const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide name"]
    },
    email: {
        type: String,
        required: [true, "Please provide email id"],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            "Please provide valid email"
        ]
    },
    role: {
        type: String,
        enum: ["user", "publisher", "admin"],
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign(
        { id: this._id, email: this.email },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.JWT_EXPIRY
        }
    );
};

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

//Generate reset password token
UserSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(20).toString("hex");
    //hash token - crypto document
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
