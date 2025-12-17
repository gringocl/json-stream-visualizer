# Claude Stream Visualizer

A CLI tool to visualize Claude Code JSON stream output in a beautiful, readable format.

## Features

- 🎨 Color-coded output for different event types
- 🔧 Tool use tracking and visualization
- 💭 Thinking block display
- 📊 Message flow visualization
- ⚡ Real-time streaming display
- 🎛️ Multiple display modes (normal, compact, raw)

## Installation

```bash
npm install
```

Make the script executable:
```bash
chmod +x agent-visualizer.js
```

## Usage

### Basic Usage

Pipe Claude Code's JSON stream output to the visualizer:

```bash
cat SOME_PROMPT.md | claude -p --output-format=stream-json --verbose | ./agent-visualizer.js
```

### Install Globally

You can link the package globally to use it from anywhere:

```bash
npm link
agent-visualizer < stream.json
```

### Using with npx

#### Local Usage (After cloning the repo)

From within the cloned repository:

```bash
# Install dependencies first
npm install

# Use npx to run without installing globally
cat prompt.md | claude -p --output-format=stream-json | npx agent-visualizer

# With flags
echo '{"type":"message_start"}' | npx agent-visualizer --compact
```

#### Direct from GitHub

Once merged to the main branch, users can run directly from GitHub:

```bash
# This will work after merging to main
cat prompt.md | claude -p --output-format=stream-json | npx gringocl/json-stream-visualizer
```

**Note:** Currently on branch `claude/json-stream-visualizer-dINx4`. For now, clone the repo and use `npx .` or `npx agent-visualizer` from within the directory.

#### Publishing to npm (Optional)

To make it available as a public npm package:

1. Update `package.json` with a unique name (e.g., `@gringocl/claude-stream-visualizer`)
2. Run `npm publish`
3. Users can then run: `npx @gringocl/claude-stream-visualizer`

### Display Modes

#### Normal Mode (default)
Shows formatted, color-coded output with all details:
```bash
cat prompt.md | claude -p --output-format=stream-json | ./agent-visualizer.js
```

#### Compact Mode
Hides verbose details like tool inputs and thinking content:
```bash
cat prompt.md | claude -p --output-format=stream-json | ./agent-visualizer.js --compact
```

#### Raw JSON Mode
Shows the raw JSON events for debugging:
```bash
cat prompt.md | claude -p --output-format=stream-json | ./agent-visualizer.js --raw
```

## Event Types Supported

The visualizer handles the following Claude stream event types:

- **message_start** - Start of a new message
- **message_delta** - Message updates (stop reason, etc.)
- **message_stop** - End of message
- **content_block_delta** - Text content from the assistant
- **tool_use_block_start** - Tool invocation start
- **tool_use_block_delta** - Tool input parameters
- **tool_use_block_end** - Tool invocation complete
- **tool_result** - Results from tool execution
- **thinking_block_start** - Start of thinking process
- **thinking_block_delta** - Thinking content
- **thinking_block_end** - End of thinking
- **error** - Error events
- **ping** - Keepalive events

## Output Examples

### Tool Usage
```
🔧 Tool: Read
   ID: toolu_01ABC123

   {
     "file_path": "/path/to/file.js"
   }

✓ Tool Result
   ID: toolu_01ABC123

   File contents...
```

### Message Flow
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📨 Message Start
   Role: assistant
   Model: claude-sonnet-4-5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Assistant response content...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Message Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Requirements

- Node.js 14+ (for ES modules support)
- npm or yarn

## Dependencies

- [chalk](https://github.com/chalk/chalk) - Terminal string styling

## License

MIT
