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
  try {
    return turndownService.turndown(html)
  } catch (error) {
    console.error('Markdown conversion failed:', error.message)
    console.log('Returning HTML as-is')
    // If conversion fails, return the HTML as-is
    return html
  }
}

/**
 * Extract body content using regex fallback
 * Used when jsdom fails to parse the HTML
 */
function extractBodyWithRegex(html) {
  // Try to extract content between <body> and </body> tags
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  if (bodyMatch && bodyMatch[1]) {
    return bodyMatch[1].trim()
  }
  // If no body tags found, return the original HTML
  return html
}

/**
 * Extract main content from HTML using Readability
 * Returns null if no main content could be extracted
 */
export function extractMainContent(html) {
  try {
    // Suppress stderr during jsdom parsing to avoid CSS error spam
    const originalStderrWrite = process.stderr.write
    let suppressedErrors = []
    let hadCssError = false
    
    process.stderr.write = (chunk, encoding, callback) => {
      // Capture but don't print jsdom CSS errors
      const str = chunk.toString()
      if (str.includes('Could not parse CSS stylesheet') || 
          str.includes('jsdom/lib/jsdom/living/helpers/stylesheets')) {
        hadCssError = true
        suppressedErrors.push(str)
        if (typeof encoding === 'function') {
          encoding()
        } else if (callback) {
          callback()
        }
        return true
      }
      // Pass through other errors normally
      return originalStderrWrite.call(process.stderr, chunk, encoding, callback)
    }
    
    try {
      const dom = new JSDOM(html)
      const reader = new Readability(dom.window.document)
      const article = reader.parse()
      
      if (article && article.content) {
        return article.content
      }
      
      // If Readability couldn't extract content and we had CSS errors,
      // try regex fallback
      if (hadCssError) {
        console.log('Readability failed with CSS errors, trying regex fallback...')
        const fallback = extractBodyWithRegex(html)
        return fallback
      }
      
      return null
    } finally {
      // Always restore stderr
      process.stderr.write = originalStderrWrite
      
      // Log suppressed errors in a compact way if there were any
      if (suppressedErrors.length > 0 && !hadCssError) {
        // Only log if we didn't already log above
        console.error('jsdom CSS parsing warnings (suppressed verbose output)')
      }
    }
  } catch (error) {
    console.error('Readability extraction failed:', error.message)
    console.log('Falling back to regex-based body extraction')
    // Fallback to regex extraction of body content
    return extractBodyWithRegex(html)
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

