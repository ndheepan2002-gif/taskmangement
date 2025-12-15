const mongoose = require("mongoose");

const taskShareSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: { type: String },
    status: { type: String, default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("TaskShare", taskShareSchema);
