const express = require("express");
const adminOnly = require("../middleware/adminMiddleware");
const protect = require("../middleware/authMiddleware");
const { getAllUsers, getAllTasks } = require("../controllers/adminController");

const router = express.Router();

router.get("/users", protect, adminOnly, getAllUsers);
router.get("/tasks", protect, adminOnly, getAllTasks);

module.exports = router;
