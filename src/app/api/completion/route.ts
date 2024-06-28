import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await generateText({
    model: openai('gpt-4o'),
    prompt: `Generate a short (5-10 words) chat title based on the following initial conversation. If the initial conversation is too short, infer to where the conversation could go. The conversation is a set of messages, stringified: ${JSON.stringify(messages)}`
  })

  return NextResponse.json({ title: result.text.replaceAll(`"`, '') })
}
