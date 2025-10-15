import { categorizeInput, fetchUrl } from './input-processor.js'

/**
 * Build prompt and content for LLM based on input type
 * Returns { prompt: string, content: string|null, useAttachment: boolean }
 */
export async function buildPrompt(promptTemplate, input, urlmode) {
  const category = categorizeInput(input)
  
  let processedInput = input
  let useAttachment = false
  
  // Handle URLs by fetching them first
  if (category.type === 'url') {
    try {
      processedInput = await fetchUrl(category.value, urlmode)
      // URLs become long content after fetching
      useAttachment = true
    } catch (error) {
      throw new Error(`Failed to fetch URL: ${error.message}`)
    }
  } else if (category.type === 'short') {
    // Short phrases go directly into prompt
    useAttachment = false
  } else {
    // Long text becomes attachment
    useAttachment = true
  }
  
  // Replace [INPUT] in prompt
  let finalPrompt
  if (useAttachment) {
    finalPrompt = promptTemplate.replace(/\[INPUT\]/g, 'the attachment')
  } else {
    finalPrompt = promptTemplate.replace(/\[INPUT\]/g, processedInput)
  }
  
  return {
    prompt: finalPrompt,
    content: useAttachment ? processedInput : null,
    useAttachment
  }
}

