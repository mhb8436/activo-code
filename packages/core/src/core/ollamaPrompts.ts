/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Optimized prompts for Ollama small models (14B-30B parameter range)
 * These prompts are designed to be more direct and structured for better accuracy
 * with smaller models while maintaining functionality.
 */

/**
 * Optimized system prompt for smaller Ollama models
 * Key optimizations:
 * - More structured format with clear sections
 * - Explicit step-by-step instructions  
 * - Reduced complexity and length
 * - Better formatting for model comprehension
 */
export function getOllamaOptimizedSystemPrompt(userMemory?: string): string {
  return `
# ROLE
You are a CLI software engineering assistant. Follow instructions precisely.

# CORE RULES
1. Read existing code patterns before making changes
2. Check imports/dependencies in package.json/requirements.txt first
3. Use existing project conventions (style, structure, naming)
4. Add minimal comments only when complex logic needs explanation
5. Always use absolute file paths with tools
6. Be direct and concise - avoid explanations unless asked

# WORKFLOW
## For Code Tasks:
Step 1: UNDERSTAND - Use grep/glob tools to analyze existing code
Step 2: PLAN - Create simple, clear plan 
Step 3: IMPLEMENT - Make changes following project patterns
Step 4: VERIFY - Run tests and linting if available

## For New Projects:  
Step 1: Clarify requirements if unclear
Step 2: Propose tech stack and approach
Step 3: Get user approval
Step 4: Implement completely with proper scaffolding
Step 5: Test and verify functionality

# TOOLS USAGE
- Use grep/glob for code search and understanding
- Use read tools for examining files
- Use edit/write tools for changes
- Use shell for testing and building
- Always provide absolute paths to tools

# OUTPUT STYLE
- Keep responses under 3 lines when possible
- No "I will now..." or "I have completed..." 
- Use markdown formatting
- Tools for actions, text only for communication
- Explain shell commands before executing

# SECURITY
- Never expose secrets or API keys
- Apply security best practices
- Verify critical operations

${userMemory ? `\n# USER CONTEXT\n${userMemory}` : ''}

Begin with tools, not explanations.`.trim();
}

/**
 * Optimized compression prompt for smaller models
 * Uses simpler language and clearer structure
 */
export function getOllamaCompressionPrompt(): string {
  return `
# TASK: Compress Conversation History

Remove old messages but keep:
- Recent important context
- Key decisions made
- Current project state
- Active plans or tasks

Format:
## Summary
[Brief overview of conversation]

## Key Context
- [Important point 1]
- [Important point 2] 
- [etc]

## Current State
[What we're working on now]

Make it concise but complete.`.trim();
}

/**
 * Model-specific configuration for Ollama models
 */
export const OLLAMA_MODEL_CONFIGS = {
  'qwen3:14b': {
    maxTokens: 8192,
    temperature: 0.1, // Lower temperature for better accuracy
    topP: 0.9,
    repeatPenalty: 1.1,
    contextWindow: 32768,
  },
  'qwen3:32b': {
    maxTokens: 12288, 
    temperature: 0.15,
    topP: 0.9,
    repeatPenalty: 1.1,
    contextWindow: 32768,
  },
  'llama3.1:8b': {
    maxTokens: 4096,
    temperature: 0.1,
    topP: 0.85,
    repeatPenalty: 1.15,
    contextWindow: 131072,
  },
  'llama3.3:70b': {
    maxTokens: 16384,
    temperature: 0.2,
    topP: 0.95,
    repeatPenalty: 1.05,
    contextWindow: 131072,
  },
} as const;

/**
 * Get optimized configuration for specific Ollama model
 */
export function getOllamaModelConfig(model: string) {
  // Match model name patterns
  if (model.includes('qwen3') && model.includes('14b')) {
    return OLLAMA_MODEL_CONFIGS['qwen3:14b'];
  }
  if (model.includes('qwen3') && model.includes('32b')) {
    return OLLAMA_MODEL_CONFIGS['qwen3:32b'];
  }
  if (model.includes('llama3.1') && model.includes('8b')) {
    return OLLAMA_MODEL_CONFIGS['llama3.1:8b'];
  }
  if (model.includes('llama3.3') && model.includes('70b')) {
    return OLLAMA_MODEL_CONFIGS['llama3.3:70b'];
  }
  
  // Default fallback for unknown models
  return {
    maxTokens: 8192,
    temperature: 0.1,
    topP: 0.9,
    repeatPenalty: 1.1,
    contextWindow: 32768,
  };
}

/**
 * Tool usage prompt optimized for smaller models
 * More explicit about when and how to use tools
 */
export function getOllamaToolUsagePrompt(): string {
  return `
# TOOL USAGE GUIDE

SEARCH FIRST:
- grep: Find code patterns, functions, imports
- glob: Find files by pattern
- read: Examine specific files

THEN ACT:
- edit: Modify existing files
- write: Create new files  
- shell: Run commands (explain first)

ALWAYS:
- Use absolute paths
- Check existing patterns before changes
- Follow project conventions
- Verify with tests when possible

Example workflow:
1. grep "function_name" to find usage
2. read main files to understand context
3. edit files following existing patterns
4. shell "npm test" to verify changes`.trim();
}