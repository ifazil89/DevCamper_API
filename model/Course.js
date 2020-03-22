const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please give course title"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please give course description"]
    },
    weeks: {
        type: String,
        required: [true, "Please give number of weeks"]
    },
    tuition: {
        type: Number,
        required: [true, "Please add tuition cost"]
    },
    minimumSkill: {
        type: String,
        required: [true, "Please add minimum skills"],
        enum: ["beginner", "intermediate", "advanced"]
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: "Bootcamp",
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    }
});

//static method to get average cost (tution) for the bootacmp
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    console.log(`Calculating average cost for ${bootcampId}`);

    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageCost: { $avg: "$tuition" }
            }
        }
    ]);
    console.log(obj);

    //updating the bootcamp
    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost)
        });
    } catch (error) {
        console.error(error);
    }
};

//call getAverage to update averageCost after save
CourseSchema.post("save", async function() {
    this.constructor.getAverageCost(this.bootcamp);
});

//call getAverage to update averageCost pre remove
CourseSchema.post("remove", async function() {
    this.constructor.getAverageCost(this.bootcamp);
});

module.exports = mongoose.model("Course", CourseSchema);
