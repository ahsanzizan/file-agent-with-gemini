import * as fs from "fs";
import * as path from "path";

import { generationConfig } from "./config";
import { executeActions } from "./execute";
import { genAI } from "./google-genai";
import { Action } from "./types";
import { buildPrompt, loadFileTree, prettyPrintPlan, rl } from "./utils";

export const askGemini = async (userInput: string, fileTree: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

const main = async () => {
  const askForRootDir = async (): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(
        "Enter root directory path (default: current directory): ",
        (input) => {
          const rootDir = input.trim() || ".";

          if (!fs.existsSync(rootDir)) {
            console.log(
              `❌ Directory '${rootDir}' does not exist. Please try again.`
            );
            resolve(askForRootDir());
          } else if (!fs.statSync(rootDir).isDirectory()) {
            console.log(
              `❌ '${rootDir}' is not a directory. Please try again.`
            );
            resolve(askForRootDir());
          } else {
            const absolutePath = path.resolve(rootDir);
            console.log(`✅ Using root directory: ${absolutePath}`);
            resolve(absolutePath);
          }
        }
      );
    });
  };

  const rootPath = await askForRootDir();
  let fileTree = loadFileTree(rootPath);
  let currentPlan: Action[] = [];

  const promptUser = () => {
    console.log("\nCommands:");
    console.log("  list                - List current files");
    console.log("  ask [prompt]        - Ask Gemini to plan actions");
    console.log("  show                - Show current planned actions");
    console.log("  execute             - Execute planned actions");
    console.log("  root                - Change root directory");
    console.log("  exit                - Quit");

    rl.question("\n> ", async (command) => {
      if (command === "list") {
        // Reload the file tree in case it changed
        fileTree = loadFileTree(rootPath);
        console.log(fileTree);
        promptUser();
      } else if (command.startsWith("ask ")) {
        const userInput = command.substring(4);
        try {
          const geminiOutput = await askGemini(userInput, fileTree);
          try {
            currentPlan = geminiOutput;
            prettyPrintPlan(currentPlan);
          } catch (err) {
            console.log("❌ Failed to parse Gemini output!");
            console.log("Raw output:", geminiOutput);
          }
        } catch (err) {
          console.error("❌ Error communicating with Google Gemini:", err);
        }
        promptUser();
      } else if (command === "show") {
        if (currentPlan.length > 0) {
          prettyPrintPlan(currentPlan);
        } else {
          console.log("⚠️  No actions planned yet!");
        }
        promptUser();
      } else if (command === "execute") {
        if (currentPlan.length > 0) {
          try {
            await executeActions(currentPlan, rootPath);
            // Refresh the file tree after execution
            fileTree = loadFileTree(rootPath);
          } catch (err) {
            console.error("❌ Error during execution:", err);
          }
        } else {
          console.log("⚠️  No actions to execute!");
        }
        promptUser();
      } else if (command === "root") {
        // Change root directory
        const newRootPath = await askForRootDir();
        if (newRootPath !== rootPath) {
          fileTree = loadFileTree(newRootPath);
          currentPlan = []; // Clear the current plan as it's for the old root
        }
        promptUser();
      } else if (command === "exit") {
        console.log("👋 Goodbye!");
        rl.close();
      } else {
        console.log("❓ Unknown command!");
        promptUser();
      }
    });
  };

  // Show initial file tree
  console.log("\n📂 Current file structure:");
  console.log(fileTree);

  // Start the command loop
  promptUser();
};

main().catch((err) => console.error(err));
