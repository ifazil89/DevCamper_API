const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const logger = require("./middleware/logger");
const morgan = require("morgan");
const connectDB = require("./config/db.js");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const fileUpload = require("express-fileupload");
const path = require("path");

const app = express();
connectDB();
//app.use(logger);
//instead of logger to log the
if (process.env.NODE_ENV == "development") {
    app.use(morgan("short"));
}
app.use(express.json()); //this is for getting request body otherwise req.body will give undefined
app.use(fileUpload()); // Get req.files

app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use(errorHandler);
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log(
        `Server running on the PORT ${PORT} on the ${process.env.NODE_ENV}`
    );
});

//Hanlde un handled rejection
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
