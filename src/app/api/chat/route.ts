import { StreamData, StreamingTextResponse, streamText } from 'ai'

import { openai } from '@ai-sdk/openai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const reqJson = await req.json()
  console.info('Request:', reqJson)
  const { messages } = reqJson

  console.info('Messages:', messages)

  const result = await streamText({
    model: openai('gpt-4o'),
    messages
  })

  // return result.toAIStreamResponse()

  const data = new StreamData()

  // data.append({ test: 'value' })

  const stream = result.toAIStream({
    onFinal(_) {
      data.close()
    }
  })

  return new StreamingTextResponse(stream, {}, data)
}
