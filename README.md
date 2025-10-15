# KeyPrompt

Process clipboard content through Claude AI with intelligent input handling. Perfect for keyboard automation tools like Keyboard Maestro. Currently relies on KM to handle the clipboard stuff though. But obviously that could be added back it, it was just more robust for my purposes to have KM write to file then read from that file, since input can be long.

From [idea-tweet]((https://x.com/Malcolm_Ocean/status/1978577856876654634).) to working prototype in <2h on 2025-10-15.

## Features

- 🔗 **Smart URL Handling**: Automatically fetches URLs and converts to markdown
- 📝 **Content Extraction**: Uses Mozilla Readability to extract main content from web pages
- ⚡ **Flexible Input**: Handles short phrases, long text, and URLs differently for optimal results
- 🎯 **Template Prompts**: Use `[INPUT]` placeholder in your prompts
- ⌨️ **Keyboard Maestro Ready**: Designed for seamless automation integration

## Installation

```bash
pnpm install
```

(npm should work fine for this but [pnpm is better](https://www.youtube.com/watch?v=ZIKDJBrk56k&embeds_referring_euri=https%3A%2F%2Fpnpm.io%2F) so imma shill it)

## Usage

### Basic Usage

```bash
# Process text directly
echo "Your text here" | node cli.js --prompt "Summarize: [INPUT]"

# Use a prompt file
echo "https://example.com/article" | node cli.js --prompt-file prompts/summarize.txt

# With API key from environment
export ANTHROPIC_API_KEY="sk-ant-..."
echo "Some text" | node cli.js -f prompts/summarize.txt
```

### Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --prompt <text>` | Prompt text with `[INPUT]` placeholder | Required* |
| `-f, --prompt-file <path>` | Path to prompt file | Required* |
| `-k, --api-key <key>` | Anthropic API key | `$ANTHROPIC_API_KEY` |
| `-u, --urlmode <mode>` | URL processing: `raw`, `md`, `md-content-only` | `md-content-only` |
| `-m, --model <name>` | Model: `sonnet`, `opus`, `haiku`, or full ID | `sonnet` |
| `-t, --max-tokens <number>` | Maximum response tokens | `4096` |

*Either `--prompt` or `--prompt-file` is required (but not both)

### Model Selection

Use friendly names that automatically resolve to the latest versions:

- **`sonnet`**: Claude Sonnet 4 (default, best balance)
- **`opus`**: Claude Opus 4 (most capable)
- **`haiku`**: Claude Haiku 4 (fastest, cheapest)

Or specify older models:
- `sonnet-3.5`, `sonnet-3`
- `opus-3`
- `haiku-3.5`, `haiku-3`

Or use the full model ID: `claude-3-opus-20240229`

### URL Modes

- **`raw`**: Return HTML as-is
- **`md`**: Convert entire page to markdown
- **`md-content-only`**: Extract main content, then convert to markdown (recommended)

### Input Handling

The script intelligently processes different input types:

1. **URLs**: Fetched and processed according to `--urlmode`
2. **Short phrases** (≤100 chars): Inserted directly into prompt
3. **Long text** (>100 chars): Treated as attachment with `[INPUT]` replaced by "the attachment"

## Prompt Files

Create reusable prompt templates with the `[INPUT]` placeholder:

```
# prompts/core-thesis.txt
write a 1-paragraph summary of the core thesis of [INPUT]...
```

```
# prompts/extract-action-items.txt
Extract all action items and tasks from [INPUT]. Format them as a bulleted list.
```

See the `prompts/` directory for examples.

## Keyboard Maestro Integration

### Quick Start

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set your API key**:
   ```bash
   echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Import the demo macro**:
   - Double-click `Demo.kmmacros` to import
   - Open Keyboard Maestro and find the macro in the "Test" group
   - Update the paths in the shell script (line 60-62):
     - Replace `/path/to/node` with your node path (find it with `which node`)
     - Replace `/path/to/keyprompt/` paths with your actual installation path
     - Replace `/path/to/tmp/` with your actual temp directory (e.g., `/Users/yourname/tmp/`)

4. **Try it**:
   - Copy some text or a URL
   - Press the hotkey (default is `⌘⌥⌃⇧V` aka hyper-V)
   - Result appears in clipboard!
   - (and you get notifications when it sends and receives)

See `KEYBOARD_MAESTRO.md` for detailed setup instructions and creating additional macros.

Also if you're not already using [Paste](https://pasteapp.io/) or another clipboard manager, I highly recommend it. That way you don't lose whatever you copied when it gets replaced by the result of this command.

## Bash Examples

### Extract core thesis from a webpage

```bash
echo "https://news.ycombinator.com/item?id=12345" | \
  node cli.js -f prompts/core-thesis.txt
```

### Extract action items from meeting notes

```bash
cat meeting-notes.txt | node cli.js -f prompts/extract-action-items.txt
```

### Get raw HTML (no markdown conversion)

```bash
echo "https://api.example.com/data" | \
  node cli.js --urlmode raw -p "Summarize [INPUT]"
```

### Use different models

```bash
# Use Opus for complex analysis
echo "long article text" | node cli.js -m opus -f prompts/core-thesis.txt

# Use Haiku for quick processing
echo "short text" | node cli.js -m haiku -f prompts/extract-action-items.txt

# Use older model by version
echo "text" | node cli.js -m sonnet-3.5 -f prompts/core-thesis.txt
```

## API Key

Get your Anthropic API key from: https://console.anthropic.com/

Set it via:
- Command line: `--api-key sk-ant-...`
- Environment variable: `export ANTHROPIC_API_KEY="sk-ant-..."`

## License

MIT

