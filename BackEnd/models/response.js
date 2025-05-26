const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
    reclamationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reclamation',
        required: true
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    dateCreated: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["draft", "sent"],
        default: "sent"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Response', responseSchema);
