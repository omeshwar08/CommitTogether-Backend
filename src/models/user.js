const mongoose = require("mongoose")
const validator = require("validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const dotenv = require("dotenv");

dotenv.config()
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 4
        },
        lastName: { type: String },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email: " + value)
                }
            }
        },
        password: {
            type: String,
            required: true,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error("Please enter a strong password")
                }
            }
        },
        age: {
            type: Number,
            min: 18
        },
        gender: {
            type: String,
            validate(value) {
                if (!["male", "female"].includes(value))
                    throw new Error("Gender must be male/female")
            }
        },
        photoUrl: {
            type: String,
        },
        about: {
            type: String,
            default: "This is default value for about"
        },
        skills: {
            type: [String]
        }
    }, { timestamps: true }
)

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })
    return token;
}

userSchema.methods.validatePassword = async function (inputPassword) {
    const user = this;
    const isValid = await bcrypt.compare(inputPassword, user.password);
    return isValid;
}

const userModel = mongoose.model("User", userSchema)
module.exports = userModel