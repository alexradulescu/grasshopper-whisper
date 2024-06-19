import { generateText } from 'ai'
import { NextResponse } from 'next/server'

import { openai } from '@ai-sdk/openai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await generateText({
    model: openai('gpt-4o'),
    prompt: `Generate a short (5-7 words) chat title based on the following initial conversation. The conversation is a set of messages, stringified: ${JSON.stringify(messages)}`
  })

  return NextResponse.json({ title: result.text })
}
