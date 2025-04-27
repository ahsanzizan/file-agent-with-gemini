import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) throw new Error("GOOGLE_API_KEY is not found in the env file.");

export const genAI = new GoogleGenerativeAI(apiKey);
