const jwt = require("jsonwebtoken")
const User = require("../models/user")
const dotenv = require("dotenv");

dotenv.config()
const userAuth = async (request, response, next) => {
    try {
        const token = request.cookies.token;
        if (!token) {
            response.status(401).send("Please login!")
        }
        const decodedMessage = jwt.verify(token, process.env.JWT_SECRET)
        const { _id } = decodedMessage
        const user = await User.findById({ _id })
        if (!user) {
            throw new Error("User not found")
        }
        request.user = user
        next();
    } catch (error) {
        response.status(400).send("ERROR: " + error.message)
    }
}

module.exports = userAuth