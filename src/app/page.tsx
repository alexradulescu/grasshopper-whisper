'use client'

import { create } from 'zustand'

import { Message, useChat } from '@ai-sdk/react'
import { styled } from '@pigment-css/react'

interface Chat {
  id: string
  system?: string
  title?: string
  messages: Array<Message>
}

interface ChatsStoreState {
  selectedChatId: string
  chatList: Record<string, Chat>
  setSelectedChatId: (id: string) => void
  addUpdateChat: (chat: Chat) => void
}

const useChatsStore = create<ChatsStoreState>((set) => ({
  selectedChatId: '',
  chatList: {},
  setSelectedChatId: (id: string) => set({ selectedChatId: id }),
  addUpdateChat: (chat: Chat) => set((state: any) => ({ chatList: { ...state.chatList, [chat.id]: chat } }))
}))

export default function Home() {
  const { selectedChatId, chatList, setSelectedChatId, addUpdateChat } = useChatsStore()

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: {
      system: 'whisper'
    },
    onFinish: (message: Message) => {
      addUpdateChat({
        ...chatList[selectedChatId],
        messages: [...messages, message]
      })
      console.info({
        ...chatList[selectedChatId],
        messages: [...messages, message]
      })
    }
  })

  return (
    <Main>
      <Aside>
        <Heading>Chat History</Heading>
        <button>New Chat</button>
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
  width: '240px',
  borderRight: '1px solid black',
  flex: '0 0 auto'
})

const ChatSection = styled('section')({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0 auto'
})

const ChatList = styled('div')({
  overflowY: 'auto',
  flex: '1 0 auto'
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
