import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

export async function POST(req: Request) {
  const { prompt } = await req.json()
  console.info(prompt)

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    style: 'vivid',
    quality: 'standard'
  })
  console.info(response.data)

  return NextResponse.json({ imageUrl: response.data[0].url })
}
