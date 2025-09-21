const express = require("express")
const User = require("../models/user")
const userAuth = require("../middlewares/auth")
const { validatePatchData } = require("../utils/validation")
const bcrypt = require("bcrypt")
const profileRouter = express.Router();

profileRouter.get("/profile", userAuth, async (request, response) => {
    try {
        const user = request.user
        response.send(user)
    }
    catch (error) {
        response.status(400).send("Error: " + error.message)
    }
})

profileRouter.patch("/profile/edit", userAuth, async (request, response) => {
    //validate request body data
    try {
        if (!validatePatchData(request))
            throw new Error("Invalid Data")
        const loggedInUser = request.user
        Object.keys(request.body).forEach(key => {
            loggedInUser[key] = request.body[key]
        })
        const updatedUser = await loggedInUser.save()
        response.json({
            message: "Successfully Updated the user",
            user: updatedUser
        })
    } catch (error) {
        response.status(400).send("ERROR : " + error.message)
    }
})

profileRouter.patch("/profile/password", userAuth, async (request, response) => {
    //validate request body data
    try {
        const { currentPassword, newPassword } = request.body
        const user = request.user;
        const isPasswordValid = await user.validatePassword(currentPassword)
        if (!isPasswordValid)
            throw new Error("Invalid Current Password")
        const passwordHash = await bcrypt.hash(newPassword, 12)
        user.password = passwordHash
        await user.save()
        response.send("Password Updated Successfully")
    } catch (error) {
        response.status(400).send("ERROR: " + error.message)
    }
})

module.exports = profileRouter;