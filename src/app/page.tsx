'use client'

import { useChat } from '@ai-sdk/react'
import { styled } from '@pigment-css/react'

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      system: 'whisper'
    }
  })

  return (
    <Main>
      <Aside>
        <Heading>Chat History</Heading>
      </Aside>
      <ChatSection>
        <Heading>Chat</Heading>
        <ChatList>
          {messages.map((m) => (
            <ChatItem key={m.id}>
              {m.role === 'user' ? 'User: ' : 'AI: '}
              {m.content}
            </ChatItem>
          ))}
          {isLoading ? <ChatItem>Loading...</ChatItem> : null}
        </ChatList>
        <Form onSubmit={handleSubmit}>
          <TextArea onChange={handleInputChange} value={input} />
          <button>Send</button>
        </Form>
      </ChatSection>
    </Main>
  )
}

const Main = styled('main')({
  display: 'flex',
  height: '100dvh',
  width: '100%'
})

const Aside = styled('aside')({
  width: '300px',
  borderRight: '1px solid black',
  flex: '0 0 auto'
})

const ChatSection = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0 auto'
})

const ChatList = styled('div')({
  overflowY: 'auto'
})

const Form = styled('form')({
  display: 'flex',
  gap: '8px',
  width: '100%'
})

const TextArea = styled('textarea')({
  flex: '1 0 auto',
  minHeight: '4lh'
})

const ChatItem = styled('div')({
  display: 'flex',
  padding: '8px',
  gap: '8px'
})

const Heading = styled('h2')({
  fontSize: '24px',
  fontWeight: '500',
  borderBottom: '1px solid black'
})
