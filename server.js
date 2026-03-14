require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");

// ── Route imports ──────────────────────────────────────────
const authRoutes = require("./routes/auth");
const companyRoutes = require("./routes/company");
const experienceRoutes = require("./routes/experience");
const jobRoutes = require("./routes/job");
const searchRoutes = require("./routes/search");
const verifyRoutes = require("./routes/verify");

const app = express();

// ── Connect Database ───────────────────────────────────────
connectDB();

// ── Global Rate Limiter ────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(limiter);

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static files ───────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ── API Routes ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/verify", verifyRoutes);

// ── Health check ───────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CareerPulse API is running 🚀", env: process.env.NODE_ENV });
});

// ── Serve frontend for all non-API routes ──────────────────
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/public/index.html"));
});

// ── Global Error Handler ───────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 CareerPulse server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 API docs:    http://localhost:${PORT}/api/health\n`);
});
