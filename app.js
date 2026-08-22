const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/ai", aiRoutes);

// Serve static frontend in production (only when not running on Vercel)
if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "client/dist")));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, "client/dist/index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      message: "CodeFury backend is running perfectly"
    });
  });
}

module.exports = app;