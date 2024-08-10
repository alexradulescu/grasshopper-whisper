import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { NextResponse } from 'next/server'

/** Based on the first user and openai messages, generates a title for the conversation */
export async function POST(req: Request) {
  const { messages } = await req.json()

  /** Using plain generate, not streaming data as the whole response is very vast and short */
  const result = await generateText({
    /** Using gpt 4o mini as it is cheaper and yet fast, for limited task like a conversation title */
    model: openai('gpt-4o-mini'),
    prompt: `Generate a short (5-10 words) chat title based on the following initial conversation. If the initial conversation is too short, infer to where the conversation could go. The conversation is a set of messages, stringified: ${JSON.stringify(messages)}`
  })

  return NextResponse.json({ title: result.text.replaceAll(`"`, '') })
}
