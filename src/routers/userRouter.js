const express = require("express")
const userAuth = require("../middlewares/auth")
const userRouter = express.Router()
const ConnectionRequest = require("../models/connectionRequest")
const User = require("../models/user")

userRouter.get("/user/requests/received", userAuth, async (request, response) => {
    try {
        const loggedInUser = request.user
        const connectionRequest = await ConnectionRequest.find({
            to: loggedInUser._id,
            status: "interested"
        }).populate("from", ["firstName", "lastName", "age", "gender", "photoUrl", "about", "skills"])
        return response.json({
            message: "Pending requests",
            connectionRequest
        })
    } catch (error) {
        return response.status(400).send("ERROR: " + error.message)
    }
})

userRouter.get("/user/connections", userAuth, async (request, response) => {
    try {
        const loggedInUser = request.user
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                { from: loggedInUser._id, status: "accepted" },
                { to: loggedInUser._id, status: "accepted" }
            ]
        })
            .populate("from", "firstName lastName photoUrl age gender")
            .populate("to", "firstName lastName photoUrl age gender")
        const data = connectionRequest.map(row => {
            if (row.from._id.toString() === loggedInUser._id.toString())
                return row.to;
            return row.from;
        })
        response.json({
            "message": "Connected",
            data
        })
    } catch (error) {
        return response.status(400).send("ERROR: " + error.message)
    }
})

userRouter.get("/feed", userAuth, async (request, response) => {
    try {
        const loggedInUser = request.user;
        const page = parseInt(request.query.page) || 1;
        let limit = parseInt(request.query.limit) || 10;
        if (limit > 50) limit = 50
        const connectedData = await ConnectionRequest.find({
            $or: [{ from: loggedInUser._id }, { to: loggedInUser._id }]
        }).select("from to")
        const hideUsersFrom = new Set();
        connectedData.forEach(element => {
            hideUsersFrom.add(element.from.toString());
            hideUsersFrom.add(element.to.toString());
        });
        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersFrom) } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }).select("firstName lastName photoUrl age gender skills").limit(limit).skip((page - 1) * limit);
        return response.json(users)
    } catch (error) {
        console.log("ERROR: " + error.message);
        return response.send(error.message)
    }
})

module.exports = userRouter