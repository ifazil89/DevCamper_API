const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../util/geocoder");

const BootcampSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please give a name"],
            unique: true,
            trim: true,
            maxlength: [50, "Name cannot be more than 50 characters"]
        },
        slug: String,
        description: {
            type: String,
            required: [true, "Please give description"],
            maxlength: [500, "Descriptio cannot be more than 500 characters"]
        },
        website: {
            type: String,
            match: [
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
                "Please provide valis website"
            ]
        },
        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please provide valid email"
            ]
        },
        address: String,
        location: {
            //Geojson point
            type: {
                type: String,
                enum: ["Point"],
                required: false
            },
            coordinates: {
                type: [Number],
                required: false,
                index: "2dsphere"
            },
            formattedAddress: String,
            street: String,
            city: String,
            state: String,
            zipcode: String,
            country: String
        },
        careers: {
            type: [String],
            required: true,
            enum: [
                "Web Development",
                "Mobile Development",
                "Machine Learning",
                "UI/UX",
                "Business",
                "Data Science",
                "Others"
            ]
        },
        averageRating: {
            type: Number,
            min: [1, "Minimum rating is minimin 1"],
            max: [10, "Maximum rating is 10"]
        },
        averageCost: Number,
        photo: {
            type: String,
            default: "no-photo.jpg"
        },
        housing: {
            type: Boolean,
            default: false
        },
        jobAssistance: {
            type: Boolean,
            default: false
        },
        jobGuarantee: {
            type: Boolean,
            default: false
        },
        acceptGi: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

//Create slugify
BootcampSchema.pre("save", function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

//Create geolocation by using mapquest
BootcampSchema.pre("save", async function(next) {
    const loc = await geocoder.geocode(this.address);
    //console.log(loc);
    this.location = {
        type: "Point",
        coordinates: [loc[0].latitude, loc[0].longitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        country: loc[0].countryCode
    };
    next();
});

//Cascade delete for deleting courses on deleting bootcamp
BootcampSchema.pre("remove", async function(next) {
    const deletedCount = await this.model("Course").deleteMany({
        bootcamp: this._id
    });
    console.log(`${deletedCount} Course removed for the bootcamp ${this._id}`);
    next();
});

//Reverse populatye with virtuals
BootcampSchema.virtual("courses", {
    ref: "Course",
    localField: "_id",
    foreignField: "bootcamp",
    justOne: false
});

module.exports = mongoose.model("Bootcamp", BootcampSchema);
