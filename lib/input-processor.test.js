import { test, describe } from 'node:test'
import assert from 'node:assert'
import { fetchUrl, extractMainContent, convertToMarkdown } from './input-processor.js'

describe('input-processor', () => {
  describe('fetchUrl', () => {
    test('should successfully fetch and process malcolmocean.com article', async () => {
      const url = 'https://malcolmocean.com/2025/10/wtf-is-the-synergic-mode/'
      
      const result = await fetchUrl(url, 'md-content-only')
      
      // Should not throw an error
      assert.ok(result)
      assert.strictEqual(typeof result, 'string')
      
      // Should contain some expected content
      assert.ok(result.includes('Synergic Mode') || result.includes('synergic'))
      
      console.log('✓ Malcolm Ocean article processed successfully')
      console.log(`  Result length: ${result.length} characters`)
    })

    test('should handle paragraph.com article that causes jsdom CSS error', async () => {
      const url = 'https://paragraph.com/@ngi/negation-game'
      
      // This should not throw an error even though jsdom has CSS parsing errors
      const result = await fetchUrl(url, 'md-content-only')
      
      assert.ok(result)
      assert.strictEqual(typeof result, 'string')
      
      // Should at least extract the title
      // Note: paragraph.com is a React app, so we can only extract meta content
      // without running JavaScript. This is expected behavior.
      assert.ok(result.includes('Negation Game'), 'Should at least extract the title')
      
      console.log('✓ Paragraph.com article handled without crashing')
      console.log(`  Result length: ${result.length} characters`)
      console.log(`  Content: ${result}`)
      console.log(`  Note: Limited extraction is expected for client-side rendered apps`)
    })
  })

  describe('extractMainContent', () => {
    test('should extract content from well-formed HTML', () => {
      const html = `
        <!DOCTYPE html>
        <html>
          <head><title>Test</title></head>
          <body>
            <article>
              <h1>Main Content</h1>
              <p>This is the main content of the page.</p>
            </article>
          </body>
        </html>
      `
      
      const result = extractMainContent(html)
      assert.ok(result)
      assert.ok(result.includes('Main Content'))
    })

    test('should fallback to regex extraction when jsdom fails', () => {
      // HTML with malformed CSS that breaks jsdom
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              /* Malformed CSS that causes jsdom to fail */
              @media { broken
            </style>
          </head>
          <body>
            <h1>Body Content</h1>
            <p>This should still be extracted via regex fallback.</p>
          </body>
        </html>
      `
      
      const result = extractMainContent(html)
      assert.ok(result)
      assert.ok(result.includes('Body Content'))
      console.log('✓ Regex fallback working for malformed CSS')
    })
  })

  describe('convertToMarkdown', () => {
    test('should convert simple HTML to markdown', () => {
      const html = '<h1>Hello</h1><p>World</p>'
      const result = convertToMarkdown(html)
      
      assert.ok(result)
      assert.ok(result.includes('Hello'))
      assert.ok(result.includes('World'))
    })

    test('should handle conversion errors gracefully', () => {
      // Even if conversion fails, should not throw
      const result = convertToMarkdown('<invalid>')
      assert.ok(result !== undefined)
    })
  })
})

