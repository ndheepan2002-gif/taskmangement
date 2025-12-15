const Task = require("../models/Task");

exports.createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            status,
            dueDate,
            category,
            tags,
            estimatedHours
        } = req.body;

        //  Validate required fields
        if (!title || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Title and dueDate are required"
            });
        }

        //  Title length
        if (title.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Title cannot exceed 200 characters"
            });
        }

        //  Due date must be in the future
        const due = new Date(dueDate);
        if (due <= new Date()) {
            return res.status(400).json({
                success: false,
                message: "Due date must be a future date"
            });
        }

        //  Status validation
        const allowedStatus = ["todo", "in-progress", "completed", "archived"];
        const taskStatus = status || "todo";
        if (!allowedStatus.includes(taskStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        //  Priority validation
        const allowedPriority = ["low", "medium", "high"];
        const taskPriority = priority || "medium";
        if (!allowedPriority.includes(taskPriority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority"
            });
        }

        // Create Task
        const task = await Task.create({
            title,
            description,
            priority: taskPriority,
            status: taskStatus,
            dueDate: due,
            category,
            tags,
            estimatedHours,
            user: req.user._id
        });
        const taskdetails = {
            id: task._id,
            title: task.title,
            status: task.status,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            category: task.category,
            tags: task.tags,
            estimatedHours: task.estimatedHours,
            user: task.user,
            createdAt: task.createdAt
        };
        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: { task: taskdetails }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Task creation failed",
            error: error.message
        });
    }
};

exports.getTaskById = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Find task by ID
        const task = await Task.findById(taskId);

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Optional: restrict to owner or admin
        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to view this task"
            });
        }

        // Prepare structured response
        const taskdetails = {
            id: task._id,
            title: task.title,
            status: task.status,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            category: task.category,
            tags: task.tags,
            estimatedHours: task.estimatedHours,
            user: task.user,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        };

        res.json({
            success: true,
            message: "Task fetched successfully",
            data: { task: taskdetails }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch task",
            error: error.message
        });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const {
            title,
            description,
            priority,
            status,
            dueDate,
            category,
            tags,
            estimatedHours
        } = req.body;

        //  Find task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Optional: restrict to owner or admin
        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this task"
            });
        }

        //  Validations
        if (title && title.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Title cannot exceed 200 characters"
            });
        }

        if (dueDate) {
            const due = new Date(dueDate);
            if (due <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Due date must be a future date"
                });
            }
            task.dueDate = due;
        }

        const allowedPriority = ["low", "medium", "high"];
        if (priority && !allowedPriority.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority"
            });
        }

        const allowedStatus = ["todo", "in-progress", "completed", "archived"];
        if (status && !allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        //  Update fields
        if (title) task.title = title;
        if (description) task.description = description;
        if (priority) task.priority = priority;
        if (status) task.status = status;
        if (category) task.category = category;
        if (tags) task.tags = tags;
        if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;

        await task.save();

        // Structured response
        const taskdetails = {
            id: task._id,
            title: task.title,
            status: task.status,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            category: task.category,
            tags: task.tags,
            estimatedHours: task.estimatedHours,
            user: task.user,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        };

        res.json({
            success: true,
            message: "Task updated successfully",
            data: { task: taskdetails }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message
        });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        //  Check ownership (user or admin)
        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this task"
            });
        }

        //  Delete task
        await task.deleteOne();

        res.json({
            success: true,
            message: "Task deleted successfully",
            data: { id: taskId }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message
        });
    }
};

exports.getTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const isAdmin = req.user.role === "admin";

        // Extract query parameters
        const {
            status,
            priority,
            category,
            search,
            page = 1,
            limit = 10,
            sortby,
            "dueDate[gte]": dueGte,
            "dueDate[lte]": dueLte
        } = req.query;

        const query = {};

        // Filter by status (comma-separated)
        if (status) {
            const statusArray = status.split(",");
            query.status = { $in: statusArray };
        }

        //  Filter by priority
        if (priority) query.priority = priority;

        // Filter by category
        if (category) query.category = category;

        // Text search
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        // Due date range filter
        if (dueGte || dueLte) {
            query.dueDate = {};
            if (dueGte) query.dueDate.$gte = new Date(dueGte);
            if (dueLte) query.dueDate.$lte = new Date(dueLte);
        }

        //  Restrict for non-admin users
        if (!isAdmin) query.user = userId;

        //  Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Sorting
        let sortObj = {};
        if (sortby) {
            const [field, order] = sortby.split(":");
            sortObj[field] = order === "desc" ? -1 : 1;
        } else {
            sortObj.createdAt = -1;
        }

        //  Fetch tasks
        const tasks = await Task.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);

        const total = await Task.countDocuments(query);
        const totalPages = Math.ceil(total / limitNum);

        // Prepare tasks array
        const taskList = tasks.map(task => ({
            id: task._id,
            title: task.title,
            status: task.status,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate,
            category: task.category,
            tags: task.tags,
            estimatedHours: task.estimatedHours,
            user: task.user,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt
        }));

        // Summary by status
        const statusSummaryAgg = await Task.aggregate([
            { $match: isAdmin ? {} : { user: userId } }, // match all tasks for admin, own tasks for user
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const allStatuses = ["todo", "in-progress", "completed", "archived"];
        const statusSummary = {};

        // Initialize all statuses to 0
        allStatuses.forEach(status => {
            statusSummary[status] = 0;
        });

        // Override with actual counts from aggregation
        statusSummaryAgg.forEach(item => {
            statusSummary[item._id] = item.count;
        });

        res.json({
            success: true,
            message: "Tasks fetched successfully",
            data: {
                tasks: taskList,
                paginatinon: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages
                },
                status: statusSummary
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch tasks",
            error: error.message
        });
    }
};

exports.updateTaskStatusOnly = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status: newStatus } = req.body;

        //  Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        // Ownership/Admin check
        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to update this task"
            });
        }

        // Validate allowed statuses
        const allowedStatus = ["todo", "in-progress", "completed", "archived"];
        if (!allowedStatus.includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status"
            });
        }

        // Optional: enforce status transitions
        const statusTransitions = {
            "todo": ["in-progress", "completed", "archived"],
            "in-progress": ["completed", "archived"],
            "completed": ["archived"],
            "archived": []
        };

        if (!statusTransitions[task.status].includes(newStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status transition from "${task.status}" to "${newStatus}"`
            });
        }

        // Update status
        task.status = newStatus;
        await task.save();

        //  Minimal structured response
        res.json({
            success: true,
            message: "Task status updated successfully",
            data: {
                id: task._id,
                status: task.status,
                updatedAt: task.updatedAt
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update task status",
            error: error.message
        });
    }
};

exports.updateTaskPriority = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { priority: newPriority } = req.body;

        // Find task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        // Ownership/Admin check
        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this task" });
        }

        // Validate priority
        const allowedPriority = ["low", "medium", "high"];
        if (!allowedPriority.includes(newPriority)) {
            return res.status(400).json({ success: false, message: "Invalid priority" });
        }

        // Update
        task.priority = newPriority;
        await task.save();

        // Minimal response
        res.json({
            success: true,
            message: "Task priority updated successfully",
            data: {
                id: task._id,
                priority: task.priority,
                updatedAt: task.updatedAt
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update priority", error: error.message });
    }
};

exports.updateTaskCategory = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { category: newCategory } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        if (req.user.role !== "admin" && task.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to update this task" });
        }

        // Update
        task.category = newCategory;
        await task.save();

        res.json({
            success: true,
            message: "Task category updated successfully",
            data: {
                id: task._id,
                category: task.category,
                updatedAt: task.updatedAt
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update category", error: error.message });
    }
};
