const mongoose = require("mongoose");

const reclamationSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    object: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    dateCreation: {
        type: Date,
        default: Date.now
    },
    dateAnswer: {
        type: Date,
        default: null
    },
    statusRec: {
        type: String,
        enum: ["pending", "Answered"],
        default: "pending"
    },
    adminResponse: {
        type: String,
        default: ""
    }
});

module.exports = mongoose.model('Reclamation', reclamationSchema);
