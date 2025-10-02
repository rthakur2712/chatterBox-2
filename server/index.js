import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

import "./config/mongo.js";
import { VerifyToken, VerifySocketToken } from "./middlewares/VerifyToken.js";
import chatRoomRoutes from "./routes/chatRoom.js";
import chatMessageRoutes from "./routes/chatMessage.js";
import userRoutes from "./routes/user.js";

const app = express();
dotenv.config();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(VerifyToken);

app.use("/api/room", chatRoomRoutes);
app.use("/api/message", chatMessageRoutes);
app.use("/api/user", userRoutes);

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

/* ---------------------- SOCKET.IO ---------------------- */
global.io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
  },
  path: "/socket.io/",
  transports: ["websocket", "polling"],
});

io.use(VerifySocketToken);

global.onlineUsers = new Map();

const getKey = (map, val) => {
  for (let [key, value] of map.entries()) {
    if (value === val) return key;
  }
};

io.on("connection", (socket) => {
  console.log("⚡ Socket connected:", socket.id);

  // Track online users
  socket.on("addUser", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("getUsers", Array.from(onlineUsers));
  });

  // Join chat room
  socket.on("joinRoom", (roomId) => {
    console.log(`✅ Socket ${socket.id} joined room ${roomId}`);
    socket.join(String(roomId));
  });

  // Leave chat room
  socket.on("leaveRoom", (roomId) => {
    console.log(`👋 Socket ${socket.id} left room ${roomId}`);
    socket.leave(String(roomId));
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(getKey(onlineUsers, socket.id));
    io.emit("getUsers", Array.from(onlineUsers));
    console.log("❌ Socket disconnected:", socket.id);
  });
});
