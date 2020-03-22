const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please give review title"],
        trim: true,
        maxlength: 100
    },
    text: {
        type: String,
        required: [true, "Please give review text"]
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, "Please add rating 1 to 10"]
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

ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });

//static method to get average rating (averageRating) for the bootacmp
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    console.log(`Calculating average rating for ${bootcampId}`);

    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        },
        {
            $group: {
                _id: "$bootcamp",
                averageRating: { $avg: "$rating" }
            }
        }
    ]);
    console.log(obj);

    //updating the bootcamp
    try {
        await this.model("Bootcamp").findByIdAndUpdate(bootcampId, {
            averageRating: Math.ceil(obj[0].averageRating)
        });
    } catch (error) {
        console.error(error);
    }
};

//call getAverage to update averageRating after save
ReviewSchema.post("save", async function() {
    this.constructor.getAverageRating(this.bootcamp);
});

//call getAverage to update averageCost pre remove
ReviewSchema.post("remove", async function() {
    this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model("Review", ReviewSchema);
