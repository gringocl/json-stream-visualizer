#!/usr/bin/env node

import chalk from 'chalk';
import { createInterface } from 'readline';

// Configuration
const SHOW_RAW_JSON = process.argv.includes('--raw');
const COMPACT_MODE = process.argv.includes('--compact');

// Helper functions for formatting
const formatTimestamp = () => {
  return chalk.gray(`[${new Date().toLocaleTimeString()}]`);
};

const indent = (text, level = 1) => {
  const spaces = '  '.repeat(level);
  return text.split('\n').map(line => spaces + line).join('\n');
};

const formatJson = (obj, level = 1) => {
  return indent(JSON.stringify(obj, null, 2), level);
};

// Event handlers for different stream event types
const eventHandlers = {
  // Content block start - detect if it's text or tool use
  content_block_start: (event) => {
    if (event.content_block?.type === 'tool_use') {
      const tool = event.content_block;
      console.log('\n' + chalk.blue.bold(`🔧 Tool: ${tool.name}`));
      if (tool.id) {
        console.log(chalk.gray(`   ID: ${tool.id}`));
      }
    }
    // Text blocks start silently
  },

  // Text and tool input deltas
  content_block_delta: (event) => {
    if (event.delta?.type === 'text_delta') {
      process.stdout.write(chalk.white(event.delta.text));
    } else if (event.delta?.type === 'input_json_delta') {
      // Tool input being streamed
      if (!COMPACT_MODE) {
        process.stdout.write(chalk.cyan(event.delta.partial_json));
      }
    }
  },

  // Content block end
  content_block_stop: (event) => {
    // Silently handle block endings
    if (!COMPACT_MODE && event.index !== undefined) {
      // Could add optional logging here
    }
  },

  // Tool results
  tool_result: (event) => {
    console.log('\n' + chalk.green.bold(`✓ Tool Result`));
    if (event.tool_use_id) {
      console.log(chalk.gray(`   ID: ${event.tool_use_id}`));
    }
    if (event.content) {
      const content = typeof event.content === 'string'
        ? event.content
        : JSON.stringify(event.content, null, 2);

      const lines = content.split('\n');
      const preview = lines.slice(0, 10).join('\n');
      const truncated = lines.length > 10;

      console.log(chalk.white(indent(preview, 1)));
      if (truncated) {
        console.log(chalk.gray(`   ... (${lines.length - 10} more lines)`));
      }
    }
  },

  // Message events
  message_start: (event) => {
    console.log('\n' + chalk.magenta.bold('━'.repeat(50)));
    console.log(chalk.magenta.bold('📨 Message Start'));
    if (event.message?.role) {
      console.log(chalk.gray(`   Role: ${event.message.role}`));
    }
    if (event.message?.model) {
      console.log(chalk.gray(`   Model: ${event.message.model}`));
    }
    console.log(chalk.magenta.bold('━'.repeat(50)));
  },

  message_delta: (event) => {
    if (event.delta?.stop_reason) {
      console.log('\n' + chalk.yellow(`   Stop reason: ${event.delta.stop_reason}`));
    }
  },

  message_stop: (event) => {
    console.log('\n' + chalk.magenta.bold('━'.repeat(50)));
    console.log(chalk.magenta.bold('✓ Message Complete'));
    console.log(chalk.magenta.bold('━'.repeat(50)) + '\n');
  },

  // Thinking blocks
  thinking_block_start: (event) => {
    console.log('\n' + chalk.yellow.bold('💭 Thinking...'));
  },

  thinking_block_delta: (event) => {
    if (event.delta?.type === 'text_delta' && !COMPACT_MODE) {
      process.stdout.write(chalk.yellow(event.delta.text));
    }
  },

  thinking_block_end: (event) => {
    if (!COMPACT_MODE) {
      console.log(chalk.gray('\n   [Thinking completed]'));
    }
  },

  // Error events
  error: (event) => {
    console.log('\n' + chalk.red.bold('❌ Error'));
    console.log(chalk.red(indent(JSON.stringify(event.error, null, 2), 1)));
  },

  // Ping/keepalive
  ping: (event) => {
    if (!COMPACT_MODE) {
      console.log(chalk.gray('   [ping]'));
    }
  },

  // Generic handler for unknown event types
  default: (event, type) => {
    console.log('\n' + chalk.cyan.bold(`📦 Event: ${type}`));
    console.log(formatJson(event, 1));
  }
};

// Process a single JSON event
const processEvent = (jsonStr) => {
  try {
    const event = JSON.parse(jsonStr);

    if (SHOW_RAW_JSON) {
      console.log(chalk.gray('─'.repeat(50)));
      console.log(JSON.stringify(event, null, 2));
      console.log(chalk.gray('─'.repeat(50)));
      return;
    }

    const eventType = event.type;

    if (eventHandlers[eventType]) {
      eventHandlers[eventType](event);
    } else {
      eventHandlers.default(event, eventType);
    }
  } catch (err) {
    if (!COMPACT_MODE) {
      console.error(chalk.red(`Error parsing JSON: ${err.message}`));
      console.error(chalk.gray(`Input: ${jsonStr.substring(0, 100)}...`));
    }
  }
};

// Main function
const main = () => {
  console.log(chalk.bold.cyan('\n🎬 Claude Stream Visualizer\n'));

  if (SHOW_RAW_JSON) {
    console.log(chalk.yellow('Mode: Raw JSON\n'));
  } else if (COMPACT_MODE) {
    console.log(chalk.yellow('Mode: Compact\n'));
  }

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', (line) => {
    if (line.trim()) {
      processEvent(line);
    }
  });

  rl.on('close', () => {
    console.log('\n' + chalk.cyan.bold('Stream ended.'));
    process.exit(0);
  });

  // Handle errors
  process.stdin.on('error', (err) => {
    console.error(chalk.red(`Stdin error: ${err.message}`));
    process.exit(1);
  });
};

// Run the visualizer
main();
