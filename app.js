const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "CodeFury backend is running perfectly"
  });
});

module.exports = app;