const fs = require("fs");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const mongoose = require("mongoose");
const colors = require("colors");
const Bootcamp = require("./model/Bootcamp");
const Course = require("./model/Course");
const User = require("./model/User");
const Review = require("./model/Review");

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
});

const importData = async () => {
    try {
        const bootcamps = JSON.parse(
            fs.readFileSync(`${__dirname}/_data/bootcamps.json`, "utf-8")
        );
        const courses = JSON.parse(
            fs.readFileSync(`${__dirname}/_data/courses.json`, "utf-8")
        );
        const users = JSON.parse(
            fs.readFileSync(`${__dirname}/_data/users.json`, "utf-8")
        );
        const reviews = JSON.parse(
            fs.readFileSync(`${__dirname}/_data/reviews.json`, "utf-8")
        );

        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);
        console.log("Data Imported".green.inverse);
        process.exit();
    } catch (error) {
        console.log(error);
    }
};
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data Deleted".red.inverse);
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

if (process.argv[2] === "-i") {
    importData();
} else if (process.argv[2] === "-d") {
    deleteData();
}