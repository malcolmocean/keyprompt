#!/usr/bin/env node

import { Command } from 'commander'
import { readFileSync } from 'fs'
import { buildPrompt } from './lib/prompt-builder.js'
import { callLLM } from './lib/llm-client.js'
import { resolveModel } from './lib/model-resolver.js'

process.removeAllListeners('warning')
process.on('warning', (warning) => {
  if (warning.code === 'DEP0040') return // ignore punycode warning from node-fetch
  if (warning.name === 'ExperimentalWarning' &&
      warning.message.includes('CommonJS module') &&
      warning.message.includes('supports-color')) {
    return
  }
  // eslint-disable-next-line no-console
  console.warn(warning)
})

const program = new Command()

program
  .name('keyprompt')
  .description('Process clipboard content through LLMs with intelligent input handling')
  .version('1.0.0')
  .option('-p, --prompt <text>', 'Prompt text with [INPUT] placeholder')
  .option('-f, --prompt-file <path>', 'Path to prompt file with [INPUT] placeholder')
  .option('-i, --input-file <path>', 'Read input from file instead of stdin')
  .option('-k, --api-key <key>', 'Anthropic API key (or use ANTHROPIC_API_KEY env var)')
  .option('-u, --urlmode <mode>', 'URL processing mode: raw, md, md-content-only', 'md-content-only')
  .option('-m, --model <name>', 'Model: sonnet, opus, haiku, or full model ID', 'sonnet')
  .option('-t, --max-tokens <number>', 'Maximum tokens in response', '4096')
  .action(async (options) => {
    try {
      // Validate prompt options
      if (!options.prompt && !options.promptFile) {
        console.error('Error: Either --prompt or --prompt-file is required')
        process.exit(1)
      }
      
      if (options.prompt && options.promptFile) {
        console.error('Error: Cannot use both --prompt and --prompt-file')
        process.exit(1)
      }
      
      // Get prompt template
      let promptTemplate
      if (options.promptFile) {
        try {
          promptTemplate = readFileSync(options.promptFile, 'utf-8')
        } catch (error) {
          console.error(`Error reading prompt file: ${error.message}`)
          process.exit(1)
        }
      } else {
        promptTemplate = options.prompt
      }
      
      // Validate urlmode
      const validUrlModes = ['raw', 'md', 'md-content-only']
      if (!validUrlModes.includes(options.urlmode)) {
        console.error(`Error: Invalid urlmode. Must be one of: ${validUrlModes.join(', ')}`)
        process.exit(1)
      }
      
      // Get API key
      const apiKey = options.apiKey || process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        console.error('Error: API key is required. Provide via --api-key or ANTHROPIC_API_KEY environment variable.')
        process.exit(1)
      }
      
      // Read input from file or stdin
      let input
      if (options.inputFile) {
        try {
          input = readFileSync(options.inputFile, 'utf-8')
        } catch (error) {
          console.error(`Error reading input file: ${error.message}`)
          process.exit(1)
        }
      } else {
        input = await readStdin()
      }
      
      if (!input.trim()) {
        console.error('Error: No input provided')
        process.exit(1)
      }
      
      // Resolve model name
      const modelId = resolveModel(options.model)
      
      // Build prompt with intelligent input handling
      const { prompt, content } = await buildPrompt(
        promptTemplate,
        input,
        options.urlmode
      )
      
      // Call LLM
      const result = await callLLM({
        apiKey,
        model: modelId,
        maxTokens: parseInt(options.maxTokens, 10),
        prompt,
        content
      })
      
      // Output result to stdout
      console.log(result)
      
    } catch (error) {
      console.error(`Error: ${error.message}`)
      process.exit(1)
    }
  })

/**
 * Read all data from stdin
 */
async function readStdin() {
  const chunks = []
  
  for await (const chunk of process.stdin) {
    chunks.push(chunk)
  }
  
  return Buffer.concat(chunks).toString('utf-8')
}

program.parse()

