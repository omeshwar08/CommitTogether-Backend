const express = require("express")
const { validateSignupData } = require("../utils/validation")
const User = require("../models/user")
const bcrypt = require("bcrypt")
const validator = require("validator")
const cookieParser = require("cookie-parser")

const authRouters = express.Router();

authRouters.use(express.json())
authRouters.use(cookieParser())

authRouters.post("/signup", async (request, response) => {
    try {
        //validate the signup data
        validateSignupData(request);
        //encrypt password
        const { firstName, lastName, email, skills, age, photoUrl, gender, about, password } = request.body
        const passwordHash = await bcrypt.hash(password, 11)
        const user = new User({
            firstName, lastName, email, skills, age, photoUrl, gender, about,
            password: passwordHash
        })
        await user.save()
        response.send("User added successfully")
    } catch (error) {
        response.status(400).send("Error saving the user: " + error.message)
    }
})

authRouters.post("/login", async (request, response) => {
    try {
        const { email, password } = request.body
        if (!validator.isEmail(email)) {
            throw new Error("Invalid email")
        }

        const user = await User.findOne({ email })

        if (!user) {
            throw new Error("Invalid credentials")
        }
        const isPasswordValid = await user.validatePassword(password);
        if (isPasswordValid) {
            const token = await user.getJWT()
            response.cookie("token", token)
            response.json(user)
        }
        else {
            throw new Error("Invalid credentials")
        }
    } catch (error) {
        response.status(400).send("Error: " + error.message)
    }
})

authRouters.post("/logout", async (request, response) => {
    response.cookie("token", null, {
        expires: new Date(Date.now())
    }).send("Logout successfull")
})

module.exports = authRouters;