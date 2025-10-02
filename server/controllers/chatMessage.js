import ChatMessage from "../models/ChatMessage.js";
import { generateAIResponse } from '../services/geminiService.js';

const AI_BOT = {
  uid: 'AI_BOT',
  displayName: 'AI Assistant',
  photoURL: 'https://api.dicebear.com/9.x/bottts/svg?seed=AI'
};

export const createMessage = async (req, res) => {
  try {
    const { message, chatRoomId, sender, senderName } = req.body;

    const newMessage = new ChatMessage({ message, chatRoomId, sender });
    await newMessage.save();

    // Emit user's message immediately to room
    if (global.io) {
      global.io.to(String(chatRoomId)).emit("newMessage", {
        ...newMessage.toObject(),
        sender: { uid: sender, displayName: senderName || "User" },
      });
    }

    // Check for AI
    if (message.trim().startsWith("@AI")) {
      const prompt = message.replace(/^@AI\s*/, "").trim();
      const aiResponse = await generateAIResponse(prompt);

      const aiMessage = new ChatMessage({
        message: aiResponse,
        chatRoomId,
        sender: AI_BOT.uid,
      });
      await aiMessage.save();

      if (global.io) {
        global.io.to(String(chatRoomId)).emit("newMessage", {
          ...aiMessage.toObject(),
          sender: AI_BOT,
        });
      }

      return res.status(201).json({ userMessage: newMessage, aiMessage });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


export const getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ chatRoomId: req.params.chatRoomId });
    res.status(200).json(messages);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};
