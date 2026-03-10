import { GoogleGenAI } from "@google/genai";
import { ClearUpPrompt, QuizPrompt } from '../models/quiz.types';
import { geminiApiKey, openRouterApiKey } from "../constants/env";
import { HttpError } from "../errors/http-error";
import { quizPrompt } from "./prompts";
import { promptLlm } from "../services/llm-api";

export const ai = new GoogleGenAI({ apiKey: geminiApiKey });


//QUIZZES
export async function generateQuizFromLlm(content: QuizPrompt) {
  try {


    const rawContent = await promptLlm(quizPrompt(content))

    const cleanedJson = String(rawContent)
      .replaceAll("`", "")
      .replace("json", "");

    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error(
      "🔴 Error generating quiz at ./utils/llm.ts -> generateQuizWithLLM()", error);
    throw error;
  }
}
