import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'
import TurndownService from 'turndown'

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
})

/**
 * Check if text is a URL
 */
export function isUrl(text) {
  try {
    const url = new URL(text.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Fetch URL and process based on urlmode
 */
export async function fetchUrl(url, urlmode = 'md-content-only') {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`)
  }

  const contentType = response.headers.get('content-type') || ''
  const text = await response.text()

  // If not HTML, return as-is
  if (!contentType.includes('text/html')) {
    return text
  }

  // For HTML, process based on urlmode
  if (urlmode === 'raw') {
    return text
  }

  // Extract main content if requested
  let htmlToConvert = text
  if (urlmode === 'md-content-only') {
    const extracted = extractMainContent(text)
    if (extracted) {
      htmlToConvert = extracted
    }
    // If extraction fails, fall back to full HTML
  }

  // Convert to markdown
  return convertToMarkdown(htmlToConvert)
}

/**
 * Convert HTML to Markdown
 */
export function convertToMarkdown(html) {
  return turndownService.turndown(html)
}

/**
 * Extract main content from HTML using Readability
 * Returns null if no main content could be extracted
 */
export function extractMainContent(html) {
  try {
    const dom = new JSDOM(html)
    const reader = new Readability(dom.window.document)
    const article = reader.parse()
    
    if (article && article.content) {
      return article.content
    }
    return null
  } catch (error) {
    console.error('Readability extraction failed:', error.message)
    return null
  }
}

/**
 * Categorize input type
 */
export function categorizeInput(text) {
  const trimmed = text.trim()
  
  if (isUrl(trimmed)) {
    return { type: 'url', value: trimmed }
  }
  
  if (trimmed.length <= 100) {
    return { type: 'short', value: trimmed }
  }
  
  return { type: 'long', value: trimmed }
}

