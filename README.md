# Friday Files

A TypeScript command-line tool that uses Google's Gemini AI to help you manage your files intelligently. This tool allows you to describe file operations in natural language and automatically executes them. This project is very experimental.

## Features

- **AI-Powered**: Describe what you want to do with your files in plain English, and let Gemini figure out the steps
- **File Operations**: Move, copy, delete, rename files and folders, or compress them into zip archives
- **Visual File Tree**: See your directory structure displayed in an easy-to-read tree format
- **Multi-Platform**: Works on Windows, macOS, and Linux
- **Configurable Root**: Choose which directory to work with

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/ahsanzizan/friday-files.git
   cd friday-files
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set your Google Gemini API key:

   - Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Update the API key configuration in the `.env` file

4. Build the project:
   ```bash
   pnpm build
   ```

## Usage

Run the tool:

```bash
pnpm start
```

or

```bash
pnpm dev
```

### Commands

- `list` - Display the current file structure as a tree
- `ask [prompt]` - Ask Gemini to plan file operations based on your description
- `show` - Show currently planned actions
- `execute` - Run the planned actions
- `root` - Change the root directory
- `exit` - Quit the application

### Example Prompts

Here are some example prompts you can use with the `ask` command:

- `ask organize my downloads folder by file type`
- `ask create a backup of all my documents`
- `ask clean up temporary files in this directory`
- `ask move all images to a new folder called 'photos'`
- `ask rename all files to follow a consistent naming pattern`

## Example Workflow

1. Start the tool and select your root directory
2. Use `list` to see your files
3. Use `ask organize my project files by type and put source code in src folder` (or any instruction)
4. Review the plan with `show`
5. Execute with `execute`
6. Confirm changes with `list`

## Technical Details

This tool uses:

- **TypeScript** - For type safety and modern JavaScript features
- **Google Gemini AI** - For natural language understanding and action planning
- **Node.js fs module** - For file system operations
- **archiver** - For creating zip archives

## Error Handling

The tool includes a pretty robust error handlings (I guess).

## Author

- Ahsan Azizan ([@ahsanzizan](https://github.com/ahsanzizan))
