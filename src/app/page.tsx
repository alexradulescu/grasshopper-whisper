'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { Aside, ChatItem, ChatList, ChatSection, Form, Heading, Main, TextArea } from '@/components/components'
import { useFetch } from '@/hooks/useFetch'
import { Message, useChat } from '@ai-sdk/react'
import { Robot, UserCircle } from '@phosphor-icons/react'
import MarkdownPreview from '@uiw/react-markdown-preview'

interface Chat {
  id: string
  system?: string
  title?: string
  messages: Array<Message>
  dateTime: string | number
}

interface ChatsStoreState {
  selectedChatId: string
  chatList: Record<string, Chat>
  isStoreHydrated: boolean
  setStoreHydrated: (isHydrated: boolean) => void
  setSelectedChatId: (id: string) => void
  addUpdateChat: (chat: Chat) => void
  setChatList: (updatedChatList: Record<string, Chat>) => void
  updateTitle: (title: string, chatId: string) => void
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
      updateTitle: (title, chatId) =>
        set((state) => ({ chatList: { ...state.chatList, [chatId]: { ...state.chatList[chatId], title } } })),
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
  const { selectedChatId, chatList, setSelectedChatId, addUpdateChat, setChatList, isStoreHydrated, updateTitle } =
    useChatsStore()
  const [finishedStream, setFinishedStream] = useState(false)
  const [imageGenerator, setImageGenerator] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/chat',
    body: {
      system: 'whisper'
    },
    onFinish: () => {
      setFinishedStream(true)
    }
  })

  const { fetchData } = useFetch<any>('api/completion', { messages })
  const { loading: isImageLoading, fetchData: fetchImage } = useFetch<any>('api/images', { prompt: input })

  const getUpdateTitle = useCallback(async () => {
    const { title } = await fetchData()
    updateTitle(title, selectedChatId)
  }, [fetchData, updateTitle, selectedChatId])

  const startNewChat = useCallback(() => {
    const newChatId = crypto.randomUUID()
    addUpdateChat({
      id: newChatId,
      title: 'New Chat',
      messages: [],
      dateTime: Date.now()
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

      if (messages.length === 2) {
        getUpdateTitle()
      }
    }
  }, [finishedStream, addUpdateChat, chatList, messages, selectedChatId, getUpdateTitle])

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

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!imageGenerator) {
      handleSubmit(e)
    } else {
      console.info(`IMAGE GEN`)
      const { url } = await fetchImage()
      console.info({ url })
    }
  }

  return (
    <Main>
      <Aside>
        <Heading>Chat History</Heading>
        <button onClick={handleNewChat}>New Chat</button>
        <div>
          {Object.values(chatList)
            .reverse()
            .map((chat) => (
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
              {m.role === 'user' ? <UserCircle size={32} weight="light" /> : <Robot size={32} weight="light" />}
              <MarkdownPreview source={m.content} />
            </ChatItem>
          ))}
          {isLoading || isImageLoading ? <ChatItem>Loading...</ChatItem> : null}
        </ChatList>
        <Form onSubmit={handleSendMessage}>
          <label>
            <input type="checkbox" onChange={() => setImageGenerator((prev) => !prev)} />
            Image generator
          </label>
          <TextArea onChange={handleInputChange} value={input} />
          <button>Send</button>
        </Form>
      </ChatSection>
    </Main>
  )
}
