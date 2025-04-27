import * as archiver from "archiver";
import * as fs from "fs";
import * as path from "path";
import { Action, CompressAction } from "./types";

const copyFolderRecursive = (source: string, destination: string): void => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach((item) => {
    const sourcePath = path.join(source, item);
    const destPath = path.join(destination, item);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderRecursive(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  });
};

const compressFiles = (
  sources: string[],
  destination: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destination);
    const archive = archiver.create("zip", {
      zlib: { level: 9 },
    });

    output.on("close", () => {
      resolve();
    });

    archive.on("error", (err) => {
      reject(err);
    });

    archive.pipe(output);

    sources.forEach((source) => {
      const stats = fs.statSync(source);

      if (stats.isDirectory()) {
        archive.directory(source, path.basename(source));
      } else {
        archive.file(source, { name: path.basename(source) });
      }
    });

    archive.finalize();
  });
};

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

      const normalizeActionPath = (p: string) => {
        // Strip leading / if present
        p = p.startsWith("/") ? p.substring(1) : p;
        return path.join(rootPath, p);
      };

      switch (action.action) {
        case "move": {
          const source = normalizeActionPath(action.source);
          const destination = normalizeActionPath(action.destination);

          const destDir = path.dirname(destination);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          console.log(`Moving '${source}' to '${destination}'`);
          fs.renameSync(source, destination);
          console.log("✅ Move completed");
          break;
        }

        case "copy": {
          const source = normalizeActionPath(action.source);
          const destination = normalizeActionPath(action.destination);

          const destDir = path.dirname(destination);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          console.log(`Copying '${source}' to '${destination}'`);

          if (fs.statSync(source).isDirectory()) {
            // For directories, we need a recursive copy
            copyFolderRecursive(source, destination);
          } else {
            fs.copyFileSync(source, destination);
          }
          console.log("✅ Copy completed");
          break;
        }

        case "delete": {
          const source = normalizeActionPath(action.source);
          console.log(`Deleting '${source}'`);

          if (fs.existsSync(source)) {
            if (fs.statSync(source).isDirectory()) {
              fs.rmdirSync(source, { recursive: true });
            } else {
              fs.unlinkSync(source);
            }
            console.log("✅ Delete completed");
          } else {
            console.log("⚠️ File or directory not found");
          }
          break;
        }

        case "rename": {
          const source = normalizeActionPath(action.source);
          const destination = normalizeActionPath(action.destination);

          console.log(`Renaming '${source}' to '${destination}'`);
          fs.renameSync(source, destination);
          console.log("✅ Rename completed");
          break;
        }

        case "compress": {
          const compressAction = action as CompressAction;
          const destination = normalizeActionPath(compressAction.destination);
          const sources = compressAction.sources.map((s) =>
            normalizeActionPath(s)
          );

          // Create destination directory if it doesn't exist
          const destDir = path.dirname(destination);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }

          console.log(`Compressing files to '${destination}'`);
          await compressFiles(sources, destination);
          console.log("✅ Compression completed");
          break;
        }

        default:
          console.log(`⚠️ Unknown action type: ${action.action}`);
      }
    } catch (error) {
      console.error(`❌ Error executing action: ${error}`);
    }
  }

  console.log("\n✨ All actions executed");
};
