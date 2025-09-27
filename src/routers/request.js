const express = require("express");
const userAuth = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest")
const User = require("../models/user")
const run = require("../utils/send_email")

const requestRouter = express.Router();

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (request, response) => {
    try {
        const fromUserId = request.user._id;
        const toUserId = request.params.toUserId;
        const status = request.params.status;

        const allowedStatus = ["interested", "ignore"];
        //validate status checkpoint
        if (!allowedStatus.includes(status)) {
            throw new Error(`${status} is invalid request type`)
        }

        //check to user in db
        const toUser = await User.findById(toUserId);
        if (!toUser)
            throw new Error("User not found")

        // check if connection request is already sent
        const existingRequest = await ConnectionRequest.findOne(
            {
                $or: [
                    { from: fromUserId, to: toUserId },
                    { from: toUserId, to: fromUserId }
                ]
            }
        )
        if (existingRequest) {
            throw new Error("Connection Request already present")
        }

        const connectionRequest = new ConnectionRequest({
            from: fromUserId, to: toUserId, status: status
        });
        const data = await connectionRequest.save();

        if (status === "interested") {
            const subject = "Connection Request Received"
            const body = `${request.user.firstName} had shown interest to ${toUser.firstName}`
            const emailResponse = await run(subject, body);
        }

        // console.log(emailResponse);

        response.json({
            message: `${request.user.firstName} ${status} ${toUser.firstName}`,
            data
        })

    } catch (error) {
        response.status(400).send("ERROR: " + error.message)
    }
})

requestRouter.post("/request/review/:status/:requestId", userAuth, async (request, response) => {
    try {
        const loggedInUser = request.user;
        const { status, requestId } = request.params
        //validation for status
        const allowedStatus = ["accepted", "rejected"]
        if (!allowedStatus.includes(status)) {
            throw new Error("Invalid Request Type")
        }
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            to: loggedInUser._id,
            status: "interested"
        })
        if (!connectionRequest)
            response.status(404).send("No such connection request found")
        connectionRequest.status = status;
        const data = await connectionRequest.save();
        response.json({
            message: "Connection Request successfully reviewed",
            data
        })
    } catch (error) {
        response.status(400).send("ERROR " + error.message)
    }
})

module.exports = requestRouter;