# Keyboard Maestro Setup Guide

This guide walks you through setting up Keyboard Maestro macros for clipboard LLM processing.

## Quick Start (Import Demo Macro)

The easiest way to get started:

1. **Install dependencies** (see Prerequisites below)

2. **Import demo macro**:
   - Double-click `Demo.kmmacros` to import
   - This creates a "Test" macro group with a "KeyPrompt-CoreThesis" macro

3. **Edit the paths**:
   - Open Keyboard Maestro
   - Find the "KeyPrompt-CoreThesis" macro in the "Test" group
   - Edit the shell script action (Action 2)
   - Update these paths:
     - Line 23: Change `/path/to/tmp/keyprompt-source.txt` to your temp file location (e.g., `/Users/yourname/tmp/keyprompt-source.txt`)
     - Line 59: Set your API key or remove this line if using environment variable
     - Line 60: Change `/path/to/node` to your actual node path (run `which node` to find it)
     - Line 60: Change `/path/to/keyprompt/cli.js` to your installation path
     - Line 62: Change `/path/to/keyprompt/prompts/core-thesis.txt` to your installation path
     - Line 100: Change to match the temp file path from line 23

4. **Test it**:
   - Copy some text or a URL
   - Press the hotkey (check the trigger in Keyboard Maestro, default might be `⌘⌥V`)
   - Result appears in clipboard!

## Prerequisites

1. Install dependencies:
   ```bash
   cd /Users/YOUR_USERNAME/dev/keyprompt
   npm install
   ```

2. Set up your API key in `~/.zshrc` (or in the macro itself):
   ```bash
   echo 'export ANTHROPIC_API_KEY="sk-ant-YOUR_KEY_HERE"' >> ~/.zshrc
   source ~/.zshrc
   ```

## How the Demo Macro Works

The `Demo.kmmacros` macro uses a file-based approach:

1. **Action 1**: Writes clipboard content to a temp file
   - This handles large content better than passing via stdin
   - File: `/path/to/tmp/keyprompt-source.txt`

2. **Action 2**: Executes shell script
   - Sets API key (optional if in environment)
   - Runs `cli.js` with `--input-file` and `--prompt-file`
   - Outputs to clipboard
   - Timeout: 180 seconds

3. **Action 3**: Alert (disabled by default)
   - Can be enabled for debugging

4. **Action 4**: Cleanup
   - Deletes the temp file

## Creating Additional Macros

You can duplicate the demo macro and customize it for different prompts:

### Example: Extract Action Items

Duplicate the "KeyPrompt-CoreThesis" macro and modify:

1. **Rename** to "KeyPrompt-ActionItems"
2. **Change hotkey** to something else (e.g., `⌘⌥A`)
3. **Update shell script** (line 62):
   ```bash
   --prompt-file "/path/to/keyprompt/prompts/extract-action-items.txt"
   ```

### Example: Custom Prompt

You can also use inline prompts instead of files:

```bash
export ANTHROPIC_API_KEY="YOUR_API_KEY_GOES_HERE"
/path/to/node /path/to/keyprompt/cli.js \
--input-file "/path/to/tmp/keyprompt-source.txt" \
--prompt "Your custom prompt with [INPUT] placeholder"
```

## Advanced: Creating from Scratch

If you want to build a macro manually instead of using the demo:

### Macro Structure

1. **New Macro**
   - Create in Keyboard Maestro
   - Name it (e.g., "KeyPrompt-CoreThesis")
   - Set a hotkey trigger

2. **Action 1: Write Clipboard to File**
   - Type: "Write a File"
   - Source: "Clipboard"
   - Destination: `/Users/yourname/tmp/keyprompt-source.txt`
   - Format: Plain Text
   - Encoding: UTF8
   - Mode: Overwrite (not append)

3. **Action 2: Execute Shell Script**
   - Type: "Execute a Shell Script"
   - Display: "to Clipboard"
   - Include stderr: Yes
   - Timeout: 180 seconds
   - Script:
     ```bash
     export ANTHROPIC_API_KEY="YOUR_API_KEY_GOES_HERE"
     /path/to/node /path/to/keyprompt/cli.js \
     --input-file "/path/to/tmp/keyprompt-source.txt" \
     --prompt-file "/path/to/keyprompt/prompts/core-thesis.txt"
     ```

4. **Action 3: Delete File** (optional but recommended)
   - Type: "File" → "Delete"
   - Source: `/Users/yourname/tmp/keyprompt-source.txt`

### Alternative: Piped Approach (Simpler)

For a simpler approach without temp files:

```bash
export ANTHROPIC_API_KEY="YOUR_API_KEY_GOES_HERE"
pbpaste | /path/to/node /path/to/keyprompt/cli.js \
  --prompt-file /path/to/keyprompt/prompts/core-thesis.txt \
  2>&1
```

This works well for most content but the file-based approach in `Demo.kmmacros` is more robust for very large inputs.

## Customization Options

### Change Models

Add `--model` flag to use different models:

```bash
--model opus    # Most capable
--model sonnet  # Best balance (default)
--model haiku   # Fastest
```

### Change URL Processing

Add `--urlmode` flag for different URL handling:

```bash
--urlmode md-content-only  # Extract main content (default)
--urlmode md              # Full page as markdown
--urlmode raw             # Raw HTML
```

### Adjust Token Limit

Add `--max-tokens` flag:

```bash
--max-tokens 8000  # Longer responses
```

## Troubleshooting

### "node: command not found"
- Use full path to node: `/usr/local/bin/node` or `/opt/homebrew/bin/node`
- Find it with: `which node`

### "API key is required"
- Set in the macro script itself (line 59)
- Or set in `~/.zshrc`: `export ANTHROPIC_API_KEY="sk-ant-..."`
- Restart Terminal after adding to `~/.zshrc`

### Script times out
- Increase timeout in the Execute Shell Script action (default is 180 seconds)
- Or use `--model haiku` for faster processing
- Or use `--max-tokens 2000` to limit response length

### Temp file errors
- Make sure the temp directory exists: `mkdir -p ~/tmp`
- Use the same path in Actions 1 and 4 (write file and delete file)

### Testing manually
Run the command in Terminal first to verify it works:
```bash
echo "test text" > /tmp/test.txt
node /path/to/keyprompt/cli.js \
  --input-file /tmp/test.txt \
  --prompt "Summarize [INPUT]"
```

### Notifications not working

1. Settings ➔ Focus: check do not disturb settings and add an exception for both **Keyboard Maestro** and **Keyboard Maestro Engine**
2. Settings ➔ Notifications: enable Banners or Alerts for both **Keyboard Maestro** and **Keyboard Maestro Engine**

## Example Workflow

1. Read an article in your browser
2. Copy a paragraph or the URL (`⌘C`)
3. Press your hotkey
4. Wait a few seconds
5. Paste the processed result (`⌘V`)

Enjoy your automated clipboard LLM processing!
