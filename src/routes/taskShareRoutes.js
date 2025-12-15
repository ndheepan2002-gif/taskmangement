const express = require("express");
const router = express.Router();
const { shareTask, getSharedTasks } = require("../controllers/taskShareController");
const protect = require("../middleware/authMiddleware");

router.post("/:taskId/share", protect, shareTask);
router.get("/shared", protect, getSharedTasks);

module.exports = router;
