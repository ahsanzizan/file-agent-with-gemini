import * as fs from "fs";
import * as path from "path";

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
