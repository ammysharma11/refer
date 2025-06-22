require("dotenv").config();
const express    = require("express");
const path       = require("path");
const http       = require("http");
const { Server } = require("socket.io");
const cors       = require("cors");

const connectDB       = require("./config/db");
const userRoutes      = require("./routes/userRoutes");
const purchaseRoutes  = require("./routes/purchaseRoutes");
const reportRoutes    = require("./routes/reportRoutes");
// const referralRoutes  = require("./routes/referralRoutes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

connectDB();

app.use("/api/users",     userRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api",           reportRoutes);
// app.use("/api",           referralRoutes);

const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: "*" } });
app.set("io", io);

io.on("connection", socket => {
  socket.on("join", ({ userId }) => socket.join(userId));
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
