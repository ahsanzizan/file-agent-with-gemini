import { generationConfig, modelName } from "../ai-config";
import { ai } from "../lib/ai";
import { Action } from "../types";
import { buildPrompt } from "./prompt-builder";

export const askGemini = async (userInput: string, fileTree: string) => {
  const model = ai.getGenerativeModel({ model: modelName });

  const prompt = buildPrompt(fileTree, userInput);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig,
  });
  const response = result.response;
  const text = response.text();

  const output = JSON.parse(text) as Action[];
  return output;
};
