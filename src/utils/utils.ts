import * as archiver from "archiver";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import { Action } from "../types";

export const prettyPrintPlan = (plan: Action[]): void => {
  console.log("\n🗺  Planned Actions:");
  plan.forEach((action, idx) => {
    console.log(
      `${idx + 1}. ${action.action.toUpperCase()} ${
        action.action === "compress"
          ? JSON.stringify(action.sources)
          : action.source
      } ${action.destination ? `-> ${action.destination}` : ""}`
    );
  });
};

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const copyFolderRecursive = (
  source: string,
  destination: string
): void => {
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

export const compressFiles = (
  sources: string[],
  destination: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destination);
    const archive = archiver.create("zip", { zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

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

export const ensureDirExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export const normalizeActionPath = (p: string, rootPath: string) => {
  if (p.startsWith(rootPath)) {
    return p;
  }
  return path.join(rootPath, p.replace(/^[\/\\]/, ""));
};
