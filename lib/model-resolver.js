/**
 * Model name resolver - maps friendly names to actual model IDs
 */

const MODEL_MAP = {
  // Latest models (recommended)
  'sonnet': 'claude-sonnet-4-20250514',
  'opus': 'claude-opus-4-20250514',
  'haiku': 'claude-haiku-4-20250514',
  
  // Older models (if user specifies explicitly)
  'sonnet-3.5': 'claude-3-5-sonnet-20241022',
  'sonnet-3': 'claude-3-sonnet-20240229',
  'opus-3': 'claude-3-opus-20240229',
  'haiku-3.5': 'claude-3-5-haiku-20241022',
  'haiku-3': 'claude-3-haiku-20240307'
}

/**
 * Resolve a friendly model name to actual model ID
 * If already a full model ID, return as-is
 */
export function resolveModel(modelName) {
  const normalized = modelName.toLowerCase().trim()
  
  // Check if it's a friendly name
  if (MODEL_MAP[normalized]) {
    return MODEL_MAP[normalized]
  }
  
  // If it starts with 'claude-', assume it's already a model ID
  if (normalized.startsWith('claude-')) {
    return modelName
  }
  
  // Otherwise, throw an error with helpful message
  const validNames = Object.keys(MODEL_MAP).join(', ')
  throw new Error(
    `Unknown model: "${modelName}". Valid options: ${validNames}, or specify full model ID like "claude-3-opus-20240229"`
  )
}

/**
 * Get list of available friendly model names
 */
export function getAvailableModels() {
  return Object.keys(MODEL_MAP)
}

