import axios from "axios";
import auth from "../config/firebase";
import { io } from "socket.io-client";

// Environment variables for React (set these in your .env file)
const baseURL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";
const socketURL = process.env.REACT_APP_SOCKET_URL || "http://localhost:3001";

// Axios instance
export const api = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

// Get Firebase token
const getUserToken = async () => {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
};

// Attach token automatically to requests
api.interceptors.request.use(async (config) => {
  const token = await getUserToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket.io connection
export const initiateSocketConnection = async () => {
  const token = await getUserToken();
  if (!token) throw new Error("No authentication token available");

  const socket = io(socketURL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
};

// API calls
export const getAllUsers = async () => {
  const res = await api.get("/user");
  console.log("PRinting all users:",res);
  return res.data;
};

export const getUser = async (userId) => {
  if (!userId) throw new Error("Invalid userId passed to getUser");
  try {
    const res = await api.get(`/user/${userId}`);
    console.log("PRinting response from getUser:",res.data);
    return res.data;
  } catch (error) {
    console.error('[getUser] Error fetching user:', { userId, error: error.message });
    throw error;
  }
};

export const getUsers = async (users) => {
  if (!users?.length) throw new Error("No users provided to getUsers");
  const res = await api.post("/user/users", { users });
  return res.data;
};

export const getChatRooms = async (userId) => {
  if (!userId) throw new Error("Invalid userId passed to getChatRooms");
  const res = await api.get(`/room/${userId}`);
  return res.data;
};

export const createOrGetChatRoom = async (members) => {
  console.log("Printing members in cgcr", members);
  const cleanMembers = (members || []).filter(Boolean);

  if (cleanMembers.length !== 2) {
    throw new Error("Chatroom requires exactly 2 valid members");
  }

  const res = await api.post("/room", {
    senderId: cleanMembers[0],
    receiverId: cleanMembers[1],
  });

  console.log("PRinting response from backend for cgcr:", res);
  return res.data;
};


export const getMessagesOfChatRoom = async (chatRoomId) => {
  const res = await api.get(`/message/${chatRoomId}`);
  return res.data;
};

export const sendMessage = async (messageBody) => {
  const res = await api.post("/message", messageBody);
  return res.data;
};
