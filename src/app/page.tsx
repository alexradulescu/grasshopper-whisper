'use client'

import { useCallback, useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Message, useChat } from '@ai-sdk/react'
import { styled } from '@pigment-css/react'
import MarkdownPreview from '@uiw/react-markdown-preview'

interface Chat {
  id: string
  system?: string
  title?: string
  messages: Array<Message>
}

interface ChatsStoreState {
  selectedChatId: string
  chatList: Record<string, Chat>
  isStoreHydrated: boolean
  setStoreHydrated: (isHydrated: boolean) => void
  setSelectedChatId: (id: string) => void
  addUpdateChat: (chat: Chat) => void
  setChatList: (updatedChatList: Record<string, Chat>) => void
}

const useChatsStore = create<ChatsStoreState>()(
  persist(
    (set) => ({
      selectedChatId: '',
      chatList: {},
      isStoreHydrated: false,
      setStoreHydrated: (isHydrated) => set({ isStoreHydrated: isHydrated }),
      setSelectedChatId: (id) => set({ selectedChatId: id }),
      addUpdateChat: (chat) => set((state) => ({ chatList: { ...state.chatList, [chat.id]: chat } })),
      setChatList: (updatedChatList) => set((state) => ({ chatList: updatedChatList }))
    }),
    {
      name: 'chats-zustand-storage',
      onRehydrateStorage:
        ({ setStoreHydrated }) =>
        () =>
          setStoreHydrated(true)
    }
  )
)

export default function Home() {
  const { selectedChatId, chatList, setSelectedChatId, addUpdateChat, setChatList, isStoreHydrated } = useChatsStore()
  const [finishedStream, setFinishedStream] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      system: 'whisper'
    },
    onFinish: () => {
      setFinishedStream(true)
    }
  })

  const startNewChat = useCallback(() => {
    const newChatId = crypto.randomUUID()
    addUpdateChat({
      id: newChatId,
      title: 'New Chat',
      messages: []
    })
    setSelectedChatId(newChatId)
    setMessages([])
  }, [addUpdateChat, setSelectedChatId, setMessages])

  const loadChat = useCallback(
    (chatId: string) => {
      if (Object.keys(chatList).includes(chatId)) {
        setSelectedChatId(chatId)
        setMessages(chatList[chatId].messages)
      }
    },
    [chatList, setMessages, setSelectedChatId]
  )

  useEffect(() => {
    if (!isStoreHydrated) return

    if (selectedChatId === '') {
      startNewChat()
    }

    loadChat(selectedChatId)
  }, [selectedChatId, startNewChat, isStoreHydrated, loadChat]) // Ensures a new chat is started if no chat is selected

  useEffect(() => {
    if (finishedStream) {
      addUpdateChat({
        ...chatList[selectedChatId],
        messages
      })
      setFinishedStream(false)
    }
  }, [finishedStream, addUpdateChat, chatList, messages, selectedChatId])

  const handleNewChat = () => {
    startNewChat()
  }

  const handleSelectChat = (chatId: string) => {
    loadChat(chatId)
  }

  const handleDeleteChat = (chatId: string) => {
    if (Object.keys(chatList).includes(chatId)) {
      delete chatList[chatId]
      setChatList(chatList)
    }
  }

  return (
    <Main>
      <Aside>
        <Heading>Chat History</Heading>
        <button onClick={handleNewChat}>New Chat</button>
        <div>
          {Object.values(chatList).map((chat) => (
            <div style={{ display: 'flex' }} key={chat.id}>
              <button onClick={() => handleSelectChat(chat.id)}>
                {chat.id} - {chat.title}
              </button>
              <button onClick={() => handleDeleteChat(chat.id)}>X</button>
            </div>
          ))}
        </div>
      </Aside>
      <ChatSection>
        <Heading>Chat</Heading>
        <ChatList>
          {messages.map((m) => (
            <ChatItem key={m.id}>
              {m.role === 'user' ? 'User: ' : 'AI: '}
              <MarkdownPreview source={m.content} />
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
  flex: '1 0'
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
