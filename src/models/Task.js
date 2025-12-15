const mongoose = require("mongoose");

const allowedStatus = ["todo", "in-progress", "completed", "archived"];
const allowedPriority = ["low", "medium", "high"];

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: { type: String },
  priority: {
    type: String,
    enum: allowedPriority,
    default: "medium"
  },
  status: {
    type: String,
    enum: allowedStatus,
    default: "todo"
  },
  dueDate: {
    type: Date,
    required: true
  },
  category: { type: String },
  tags: [{ type: String }],
  estimatedHours: { type: Number, min: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
