import express from "express";
import { getAllUsers, getUser, createUser } from "../controllers/user.js";

const router = express.Router();

router.get("/", getAllUsers);
router.get("/:userId", getUser);
router.post("/", createUser);

export default router;
