import express from "express";

import {
  createOrGetChatRoom,
  getChatRoomOfUser,
  getChatRoomOfUsers,
} from "../controllers/chatRoom.js";




const router = express.Router();

router.post("/", createOrGetChatRoom);
router.get("/:userId", getChatRoomOfUser);
router.get("/:firstUserId/:secondUserId", getChatRoomOfUsers);

export default router;
