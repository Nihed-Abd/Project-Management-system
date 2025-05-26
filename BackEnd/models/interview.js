const mongoose = require("mongoose");

const interviewSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    statusInterview: {
        type: String,
        enum: ["pending" , "accepted", "declined"],
        default: "pending"
    },
    interviewGoal: {
        type: String,
        required: true
    },
    note: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
