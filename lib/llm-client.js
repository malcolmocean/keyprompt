import Anthropic from '@anthropic-ai/sdk'

/**
 * Call Anthropic API with the given prompt and optional attachment
 */
export async function callLLM({ apiKey, model, maxTokens, prompt, content }) {
  if (!apiKey) {
    throw new Error('API key is required. Provide via --api-key or ANTHROPIC_API_KEY environment variable.')
  }
  
  const client = new Anthropic({ apiKey })
  
  // Build message content
  const messageContent = []
  
  if (content) {
    // Add attachment as text block
    messageContent.push({
      type: 'text',
      text: content
    })
  }
  
  // Add the prompt
  messageContent.push({
    type: 'text',
    text: prompt
  })
  
  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [{
        role: 'user',
        content: messageContent
      }]
    })
    
    // Extract text from response
    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
    
    return textContent
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Anthropic API error: ${error.message}`)
    }
    throw error
  }
}

