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
    n: 1, // Dall-e 3 only supports 1 image in parallel.
    size: '1024x1024', // Maybe configurable in the future.
    style: 'vivid', // Natural look looks off and strange
    quality: 'standard' // Standard because HD would take longer and timeout on Netlify
  })
  console.info(response.data)

  return NextResponse.json({ imageUrl: response.data[0].url })
}
