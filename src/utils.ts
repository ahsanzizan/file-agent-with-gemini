import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";
import { Action } from "./types";

export const loadFileTree = (rootPath: string = "."): string => {
  let tree = "";

  function walk(dirPath: string, prefix: string = ""): void {
    const entries = fs.readdirSync(dirPath).sort();

    entries.forEach((entry, idx) => {
      const isLast = idx === entries.length - 1;
      const fullPath = path.join(dirPath, entry);
      const connector = isLast ? "└── " : "├── ";
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        tree += `${prefix}${connector}📁 ${entry}/\n`;
        walk(fullPath, prefix + (isLast ? "    " : "│   "));
      } else {
        tree += `${prefix}${connector}📄 ${entry}\n`;
      }
    });
  }

  tree += `📂 ${rootPath}\\ \n`;
  walk(rootPath);
  return tree;
};

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

export const buildPrompt = (fileTree: string, userInput: string) => `
You are a file management AI agent.

Your job is to PLAN file operations based on user instructions.

Supported actions:
- move: Move a file or folder. (will automatically creates folder if not exist)
- copy: Copy a file or folder. (will automatically creates folder if not exist)
- delete: Delete a file or folder.
- compress: Compress multiple files into a zip archive. (will automatically creates folder if not exist)
- rename: Rename a file or folder.

Known file categories based on extensions:
- Documents: .pdf, .docx, .xlsx, .pptx, .txt
- Images: .jpg, .jpeg, .png, .gif, .bmp, .svg
- Videos: .mp4, .avi, .mov, .mkv
- Audio: .mp3, .wav, .aac, .flac
- Archives: .zip, .rar, .7z, .tar.gz
- Code: .py, .js, .ts, .html, .css, .java

Rules:
- ALWAYS respond with a JSON array of planned actions.
- If an action is not yet implemented by the system, still plan it clearly.
- DO NOT respond with unsupported actions that doesn't exist in the Supported actions list.
- NEVER explain your reasoning, only output JSON.

File system structure:

${fileTree}

User instruction:
${userInput}

Example output format:
[
  {
    "action": "move",
    "source": "/documents/reports/quarterly.pdf",
    "sources": [],
    "destination": "/archive/2025/reports/quarterly_q1.pdf"
  },
  {
    "action": "copy",
    "source": "/images/logo.png",
    "sources": [],
    "destination": "/website/assets/images/logo.png"
  },
  {
    "action": "delete",
    "source": "/temp/old_backups",
    "sources": [],
    "destination": ""
  },
  {
    "action": "rename",
    "source": "/projects/project_x.docx",
    "sources": [],
    "destination": "/projects/client_proposal_2025.docx"
  },
  {
    "action": "compress",
    "source": "",
    "sources": [
      "/documents/contracts/2025_q1.pdf", 
      "/documents/contracts/2025_q2.pdf",
      "/documents/contracts/attachments"
    ],
    "destination": "/archive/contracts_2025_h1.zip"
  }
]
`;
