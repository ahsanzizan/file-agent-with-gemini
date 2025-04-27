import * as fs from "fs";
import * as path from "path";

import { COMMANDS, MESSAGES } from "./constants";
import { Action } from "./types";
import { executeActions } from "./utils/actions-executor";
import { askGemini } from "./utils/ask-gemini";
import { loadFileTree } from "./utils/file-tree-loader";
import { prettyPrintPlan, rl } from "./utils/utils";

const main = async () => {
  const askForRootDir = async (): Promise<string> => {
    return new Promise((resolve) => {
      rl.question(MESSAGES.ENTER_ROOT_DIR, (input) => {
        const rootDir = input.trim() || ".";
        if (!fs.existsSync(rootDir)) {
          console.log(MESSAGES.DIR_NOT_EXIST(rootDir));
          resolve(askForRootDir());
        } else if (!fs.statSync(rootDir).isDirectory()) {
          console.log(MESSAGES.NOT_A_DIR(rootDir));
          resolve(askForRootDir());
        } else {
          const absolutePath = path.resolve(rootDir);
          console.log(MESSAGES.USING_DIR(absolutePath));
          resolve(absolutePath);
        }
      });
    });
  };

  let rootPath = await askForRootDir();
  let fileTree = loadFileTree(rootPath);
  let currentPlan: Action[] = [];

  const promptUser = () => {
    console.log(MESSAGES.COMMAND_LIST);

    rl.question("\n> ", async (input) => {
      const trimmedCommand = input.trim();

      if (trimmedCommand === COMMANDS.LIST) {
        fileTree = loadFileTree(rootPath);
        console.log(fileTree);
        promptUser();
      } else if (trimmedCommand.startsWith(`${COMMANDS.ASK} `)) {
        const userPrompt = trimmedCommand.substring(COMMANDS.ASK.length + 1);
        try {
          const geminiOutput = await askGemini(userPrompt, fileTree);
          try {
            currentPlan = geminiOutput;
            prettyPrintPlan(currentPlan);
          } catch (parseErr) {
            console.log(MESSAGES.FAILED_PARSE_OUTPUT);
            console.log("Raw output:", geminiOutput);
          }
        } catch (err) {
          console.error(MESSAGES.ERROR_GEMINI, err);
        }
        promptUser();
      } else if (trimmedCommand === COMMANDS.SHOW) {
        if (currentPlan.length > 0) {
          prettyPrintPlan(currentPlan);
        } else {
          console.log(MESSAGES.NO_ACTIONS_PLANNED);
        }
        promptUser();
      } else if (trimmedCommand === COMMANDS.EXECUTE) {
        if (currentPlan.length > 0) {
          try {
            await executeActions(currentPlan, rootPath);
            fileTree = loadFileTree(rootPath);
          } catch (err) {
            console.error(MESSAGES.ERROR_EXECUTION, err);
          }
        } else {
          console.log(MESSAGES.NO_ACTIONS_TO_EXECUTE);
        }
        promptUser();
      } else if (trimmedCommand === COMMANDS.ROOT) {
        const newRootPath = await askForRootDir();
        if (newRootPath !== rootPath) {
          rootPath = newRootPath;
          fileTree = loadFileTree(rootPath);
          currentPlan = [];
        }
        promptUser();
      } else if (trimmedCommand === COMMANDS.EXIT) {
        console.log(MESSAGES.GOODBYE);
        rl.close();
      } else {
        console.log(MESSAGES.UNKNOWN_COMMAND);
        promptUser();
      }
    });
  };

  console.log(MESSAGES.CURRENT_FILE_STRUCTURE);
  console.log(fileTree);

  promptUser();
};

main().catch((err) => console.error(err));
