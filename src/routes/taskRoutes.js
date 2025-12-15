const express = require("express");
const { createTask, getTasks, getTaskById, updateTask, deleteTask, updateTaskStatusOnly, updateTaskPriority, updateTaskCategory } = require("../controllers/taskController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/:taskId", protect, getTaskById);
router.put("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);
router.put("/:taskId/status", protect, updateTaskStatusOnly);
router.put("/:taskId/priority", protect, updateTaskPriority);
router.put("/:taskId/category", protect, updateTaskCategory);


module.exports = router;
