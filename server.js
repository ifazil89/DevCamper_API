const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");
const logger = require("./middleware/logger");
const morgan = require("morgan");
const connectDB = require("./config/db.js");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const fileUpload = require("express-fileupload");
const path = require("path");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xssClean = require("xss-clean"); //removes the script tags from body
const rateLimit = require("express-rate-limit"); // Limit API request per time
const hpp = require("hpp"); // Http Parameter Pollution Attack
const cors = require("cors");

const app = express();
connectDB();
//app.use(logger);
//instead of logger to log the
if (process.env.NODE_ENV == "development") {
    app.use(morgan("short"));
}
app.use(express.json()); //this is for getting request body otherwise req.body will give undefined
app.use(fileUpload()); // Get req.files
app.use(cookieParser()); // Get cookies
app.use(mongoSanitize()); // Sanitize for Mongo injection
app.use(helmet());
app.use(xssClean());
app.use(cors());

requestRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000, //10 minutes
    max: 100
});
app.use(requestRateLimit);
app.use(hpp());

app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(express.static(path.join(__dirname, "public")));
app.use(errorHandler);
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(
        `Server running on the PORT ${PORT} on the ${process.env.NODE_ENV}`
    );
});

//Hanlde un handled rejection
// app.use((req, res, next) => {
//     process.on("unhandledRejection", (err, promise) => {
//         console.log(`Unhandled Rejection Error: ${err.message}`);
//         //server.close(() => process.exit(1));
//         res.status(500).json({ status: false, message: err.message });
//     });
//     next();
// });
