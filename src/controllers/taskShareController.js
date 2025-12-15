const TaskShare = require("../models/TaskShare");
const Task = require("../models/Task");
const User = require("../models/User");

exports.shareTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { toUserId, message } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to share this task" });
        }

        const recipient = await User.findById(toUserId);
        if (!recipient) {
            return res.status(404).json({ success: false, message: "Recipient user not found" });
        }

        // Create share entry
        const sharedTask = await TaskShare.create({
            task: task._id,
            fromUser: req.user._id,
            toUser: recipient._id,
            message,
        });

        res.status(201).json({
            success: true,
            message: "Task shared successfully",
            data: {
                id: sharedTask._id,
                task: sharedTask.task,
                fromUser: sharedTask.fromUser,
                toUser: sharedTask.toUser,
                message: sharedTask.message,
                createdAt: sharedTask.createdAt
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to share task", error: error.message });
    }
};

// Get tasks shared with current user
exports.getSharedTasks = async (req, res) => {
    try {
        const sharedTasks = await TaskShare.find({ toUser: req.user._id })
            .populate("task", "title status description priority dueDate category")
            .populate("fromUser", "name email");

        const result = sharedTasks.map(item => ({
            id: item._id,
            task: item.task,
            fromUser: item.fromUser,
            message: item.message,
            status: item.status,
            createdAt: item.createdAt
        }));

        res.json({
            success: true,
            message: "Shared tasks fetched successfully",
            data: { sharedTasks: result }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch shared tasks", error: error.message });
    }
};
