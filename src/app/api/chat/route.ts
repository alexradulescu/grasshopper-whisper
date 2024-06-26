import { streamText } from 'ai'
import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

import { openai } from '@ai-sdk/openai'
import { Readability } from '@mozilla/readability'

const urlPattern = new RegExp(
  '(https?:\\/\\/)?' + // Protocol (optional)
    '([\\da-z.-]+)\\.([a-z.]{2,6})' + // Domain name
    '(\\/[\\w.-]*)*\\/?', // Path (optional)
  'i' // Case insensitive
)

const containsUrl = (text: string): string | null => {
  const match = text.match(urlPattern)
  return match ? match[0] : null
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  let articleContent: string | null = null
  const latestMessageContent = messages[messages.length - 1].content
  const url = containsUrl(latestMessageContent)
  if (!url) {
    console.error('No URL found in the provided text')
  } else {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        return console.error('Failed to fetch the URL')
      }

      const html = await response.text()
      const dom = new JSDOM(html, { url })
      const reader = new Readability(dom.window.document)
      const article = reader.parse()

      if (!article) {
        console.error('Mozilla Readability failed to parse the content')
      } else {

      articleContent = article.textContent
      console.info(`ARTICLE!!!`, article.textContent)
      }
    } catch (error) {
      console.error('Error occurred during processing')
    }
  }

  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    system: articleContent
      ? `While answering user request, please also take into account the following main content from the URL provided by the user in the latest message: ${articleContent}`
      : undefined
  })

  return result.toAIStreamResponse()
}
