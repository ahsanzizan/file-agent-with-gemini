import * as fs from "fs";
import * as path from "path";
import {
  ACTION_COMPRESS,
  ACTION_COPY,
  ACTION_DELETE,
  ACTION_MOVE,
  ACTION_RENAME,
} from "../constants";
import { Action, CompressAction, FileAction } from "../types";
import {
  compressFiles,
  copyFolderRecursive,
  ensureDirExists,
  normalizeActionPath,
} from "./utils";

export const executeActions = async (
  plan: Action[],
  rootPath: string = "."
): Promise<void> => {
  console.log("\n⚡ Executing planned actions:");

  for (const [idx, action] of plan.entries()) {
    try {
      console.log(
        `\n🔄 Executing action ${idx + 1}/${plan.length}: ${action.action}`
      );

      const sourcePath = normalizeActionPath(
        (action as FileAction).source,
        rootPath
      );
      const destinationPath =
        "destination" in action
          ? normalizeActionPath(action.destination!, rootPath)
          : undefined;

      switch (action.action) {
        case ACTION_MOVE: {
          if (!destinationPath)
            throw new Error("Destination path missing for move action");
          ensureDirExists(path.dirname(destinationPath));

          console.log(`Moving '${sourcePath}' to '${destinationPath}'`);
          fs.renameSync(sourcePath, destinationPath);
          console.log("✅ Move completed");
          break;
        }

        case ACTION_COPY: {
          if (!destinationPath)
            throw new Error("Destination path missing for copy action");
          ensureDirExists(path.dirname(destinationPath));

          console.log(`Copying '${sourcePath}' to '${destinationPath}'`);
          if (fs.statSync(sourcePath).isDirectory()) {
            copyFolderRecursive(sourcePath, destinationPath);
          } else {
            fs.copyFileSync(sourcePath, destinationPath);
          }
          console.log("✅ Copy completed");
          break;
        }

        case ACTION_DELETE: {
          console.log(`Deleting '${sourcePath}'`);
          if (fs.existsSync(sourcePath)) {
            if (fs.statSync(sourcePath).isDirectory()) {
              fs.rmdirSync(sourcePath, { recursive: true });
            } else {
              fs.unlinkSync(sourcePath);
            }
            console.log("✅ Delete completed");
          } else {
            console.log("⚠️ File or directory not found");
          }
          break;
        }

        case ACTION_RENAME: {
          if (!destinationPath)
            throw new Error("Destination path missing for rename action");

          console.log(`Renaming '${sourcePath}' to '${destinationPath}'`);
          fs.renameSync(sourcePath, destinationPath);
          console.log("✅ Rename completed");
          break;
        }

        case ACTION_COMPRESS: {
          const { sources, destination } = action as CompressAction;
          const normalizedSources = sources.map((s) =>
            normalizeActionPath(s, rootPath)
          );
          const normalizedDestination = normalizeActionPath(
            destination,
            rootPath
          );

          ensureDirExists(path.dirname(normalizedDestination));
          console.log(`Compressing files to '${normalizedDestination}'`);

          await compressFiles(normalizedSources, normalizedDestination);
          console.log("✅ Compression completed");
          break;
        }

        default:
          console.log(`⚠️ Unknown action type: ${(action as Action).action}`);
      }
    } catch (error) {
      console.error(`❌ Error executing action:`, error);
    }
  }

  console.log("\n✨ All actions executed");
};
