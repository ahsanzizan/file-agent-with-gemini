export const COMMANDS = {
  LIST: "list",
  ASK: "ask",
  SHOW: "show",
  EXECUTE: "execute",
  ROOT: "root",
  EXIT: "exit",
};

export const MESSAGES = {
  ENTER_ROOT_DIR: "Enter root directory path (default: current directory): ",
  DIR_NOT_EXIST: (dir: string) =>
    `❌ Directory '${dir}' does not exist. Please try again.`,
  NOT_A_DIR: (dir: string) =>
    `❌ '${dir}' is not a directory. Please try again.`,
  USING_DIR: (dir: string) => `✅ Using root directory: ${dir}`,
  NO_ACTIONS_PLANNED: "⚠️  No actions planned yet!",
  NO_ACTIONS_TO_EXECUTE: "⚠️  No actions to execute!",
  GOODBYE: "👋 Goodbye!",
  UNKNOWN_COMMAND: "❓ Unknown command!",
  FAILED_PARSE_OUTPUT: "❌ Failed to parse Gemini output!",
  ERROR_GEMINI: "❌ Error communicating with Google Gemini:",
  ERROR_EXECUTION: "❌ Error during execution:",
  CURRENT_FILE_STRUCTURE: "\n📂 Current file structure:",
  COMMAND_LIST: `
Commands:
  list                - List current files
  ask [prompt]        - Ask Gemini to plan actions
  show                - Show current planned actions
  execute             - Execute planned actions
  root                - Change root directory
  exit                - Quit
`,
};

export const ACTION_MOVE = "move";
export const ACTION_COPY = "copy";
export const ACTION_DELETE = "delete";
export const ACTION_RENAME = "rename";
export const ACTION_COMPRESS = "compress";
