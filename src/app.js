const express = require("express");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Task Management API is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/taskshare", require("./routes/taskShareRoutes"));

app.use(errorHandler);

module.exports = app;
