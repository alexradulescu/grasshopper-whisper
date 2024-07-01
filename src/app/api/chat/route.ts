import { openai } from '@ai-sdk/openai'
import { Readability } from '@mozilla/readability'
import { streamText } from 'ai'
import { JSDOM } from 'jsdom'
import fetch from 'node-fetch'

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

/** Fetches and parses the URL content
 * 1. Fetch the full html content of the URL. If the page is JS driven, then it won't get anything.
 * 2. Parse the content using Mozilla Readability, best for article and documentation stile links.
 */
const getArticleContent = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url)

    if (!response.ok) {
      console.error('Failed to fetch the URL')
      return null
    }

    const html = await response.text()
    const dom = new JSDOM(html, { url })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    if (!article) {
      console.error('Mozilla Readability failed to parse the content')
      return null
    } else {
      return article.textContent
    }
  } catch (error) {
    console.error('Error occurred during processing')
    return null
  }
}

/** Allow streaming responses up to 26 seconds, netlify max. Vercel has a much higher limit */
export const maxDuration = 26

export async function POST(req: Request) {
  const { messages } = await req.json()

  let articleContent: string | null = null
  const latestMessageContent = messages[messages.length - 1].content
  const url = containsUrl(latestMessageContent)
  if (!url) {
    console.error('No URL found in the provided text')
  } else {
    articleContent = await getArticleContent(url)
  }

  const result = await streamText({
    /** Using gpt-4 omni by default for now. Might add model selector later on if needed. */
    model: openai('gpt-4o'),
    messages,
    /** Custom system message in case there is a link provided by the user to extract data. */
    system: articleContent
      ? `While answering user request, please also take into account the following main content from the URL provided by the user in the latest message: ${articleContent}`
      : undefined
  })

  return result.toAIStreamResponse()
}
