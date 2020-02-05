const mongoose = require("mongoose");

const connectDb = async () => {
    const con = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    });

    console.log(
        `Mongo DB connected : ${con.connection.host}`.cyan.underline.bold
    );
};

module.exports = connectDb;
