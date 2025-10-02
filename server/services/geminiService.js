import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateAIResponse = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY in environment');

  const payload = {
    prompt,
  };

  const ai = new GoogleGenAI({});
  
  
  const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    console.log(resp.text);
  

  const data = resp.text;
  // Extract text depending on actual response shape:
  const mentorText = data;
  return mentorText;
}