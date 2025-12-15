const User = require("../models/User");
const Task = require("../models/Task");

exports.getAllUsers = async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
};

exports.getAllTasks = async (req, res) => {
    const tasks = await Task.find().populate("user", "email");
    res.json(tasks);
};
