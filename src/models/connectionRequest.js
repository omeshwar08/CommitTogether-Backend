const mongoose = require("mongoose")

const connectionRequestSchema = new mongoose.Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    status: {
        type: String,
        enum: {
            values: ["ignore", "interested", "accepted", "rejected"],
            message: `{VALUE} is not a valid status type`
        },
        required: true
    }
},
    { timestamps: true }
);

connectionRequestSchema.pre("save", function (next) {
    if (this.from.equals(this.to))
        throw new Error("from and to user cannot be same")
    next();
})

connectionRequestSchema.index({ from: 1, to: 1 })

const ConnectionRequestModel = new mongoose.model("ConnectionRequest", connectionRequestSchema);
module.exports = ConnectionRequestModel;