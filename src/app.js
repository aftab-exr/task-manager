import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import taskRoute from "./routes/task.route.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "16kb"}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.use("/api/users", userRoute);
app.use("/api/tasks", taskRoute);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors || []
    });
});

export default app ;