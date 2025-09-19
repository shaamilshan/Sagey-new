require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// ---------------------- MIDDLEWARES ----------------------
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(logger("dev"));

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../client/dist")));

// ✅ CORS setup (allow Vite + production domains)
const corsOptions = {
  origin: [
    "http://localhost:5173", // Vite frontend
    "http://localhost:5174", // if using another dev port
    "http://localhost:3000", // optional for backend direct calls
    "https://sagey.in",
    "https://www.sagey.in",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Handle preflight (OPTIONS) requests
app.options("*", cors(corsOptions));

// ---------------------- TEST ROUTES ----------------------
app.get("/api/health", (req, res) => {
  res.json({
    message: "Server is running!",
    timestamp: new Date(),
    status: "OK",
  });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Test route working!" });
});

// ---------------------- API ROUTES ----------------------
try {
  const userRoutes = require("./routes/user");
  const adminRoutes = require("./routes/admin");
  const superAdminRoutes = require("./routes/superAdmin");
  const publicRoutes = require("./routes/public");
  const authRoutes = require("./routes/auth");

  app.use("/api/auth", authRoutes);
  app.use("/api/user", userRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/super-admin", superAdminRoutes);
  app.use("/api/public", publicRoutes);

  console.log("All routes loaded successfully");
} catch (error) {
  console.log("Error loading routes:", error.message);
}

// ---------------------- STATIC FILES ----------------------
app.use("/api/img", express.static(path.join(__dirname, "public/products")));
app.use("/api/off", express.static(path.join(__dirname, "public/official")));

// ---------------------- ERROR HANDLING ----------------------
app.use((error, req, res, next) => {
  console.error("Server Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    type: error.type || "unknown",
  });

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "File too large (max 50MB)" });
  }

  if (error.code === "LIMIT_FIELD_VALUE") {
    return res.status(413).json({ error: "Request payload too large (50MB)" });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ error: "Unexpected file field" });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "Request entity too large" });
  }

  res.status(500).json({
    error: "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// ---------------------- FRONTEND FALLBACK ----------------------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

// ---------------------- DATABASE + SERVER ----------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    const port = process.env.PORT || 3000;

    // ✅ Explicitly log protocol (HTTP)
    app.listen(port, "0.0.0.0", () => {
      console.log(`🚀 Server running at http://localhost:${port} - DB Connected`);
    });
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error);
  });