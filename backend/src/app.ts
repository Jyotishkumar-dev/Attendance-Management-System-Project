import hodRoutes from "./routes/hod";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import authRoutes from "./routes/auth";
import departmentRoutes from "./routes/departments";
import subjectRoutes from "./routes/subjects";
import studentRoutes from "./routes/students";
import facultyRoutes from "./routes/faculty";
import attendanceRoutes from "./routes/attendance";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.get("/health", (_req, res) => res.json({ status: "ok" }));


app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/hod", hodRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
