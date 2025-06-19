


// src/server.js

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const { Server } = require("socket.io");

dotenv.config(); // Load .env variables

// Import route files
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");

// Initialize app and server
const app = express();
const cors = require("cors");
app.use(cors());
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Attach socket.io to all requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/purchase", purchaseRoutes);
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
}); 

// Start the server
const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
