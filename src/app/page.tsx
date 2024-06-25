'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { useFetch } from '@/hooks/useFetch'
import { Message, useChat } from '@ai-sdk/react'
import { Robot, UserCircle } from '@phosphor-icons/react'
import MarkdownPreview from '@uiw/react-markdown-preview'

import styles from './styles.module.css'

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
    <main className={styles.main}>
      <aside className={styles.aside}>
        <header className={styles.asideHeader}>
          <span className={styles.asideHeaderText}>
            <svg className={styles.bullishLogo} fill="none" viewBox="0 0 579 299" xmlns="http://www.w3.org/2000/svg">
              <title>Bullish</title>
              <path
                d="M263.619 94.2131C226.143 63.9677 186.524 49.9167 136.19 42.8674C90.9524 36.5326 63.619 27.4828 23.9524 0L0 35.6752C35.5238 62.1102 68.8095 75.2085 113.905 83.0199C145.81 88.545 170.762 88.9261 203.952 106.549C197.429 115.028 191.476 127.507 187.857 135.985C171.286 126.173 146.857 118.648 114.238 118.314V160.8C130.095 161.467 144.333 163.42 163.524 171.755C186.905 181.901 203.19 197.095 203.19 197.095C221.857 131.508 263.619 94.2131 263.619 94.2131ZM368.333 149.798C334.048 175.28 312.667 213.527 306.905 255.919H271.714C291 101.739 432.667 87.8782 459.571 84.0678C508.143 77.209 542.952 62.1578 578.429 35.7229L554.476 0.0476188C514.81 27.5304 487.476 36.5802 442.238 42.915C391.905 49.9644 350.571 65.0632 313.095 95.3086C254.81 141.32 227.381 208.955 227.381 277.305L227.429 298.643H346.762V277.257C346.286 214.528 393.524 184.044 393.524 184.044C410.429 172.613 435.81 159.8 464.191 160.896V118.409C432.286 118.076 399.286 128.221 368.333 149.798Z"
                fill="currentColor"
              ></path>
            </svg>
            Bullish GPT
          </span>
          <button className={styles.iconButton} onClick={handleNewChat}>
            +
          </button>
        </header>
        <div className={styles.chatHistoryWrapper}>
          <input
            type="search"
            placeholder="&#x1F50D; Search conversations"
            className={styles.chatHistorySearch}
          ></input>

          {Object.values(chatList)
            .reverse()
            .map((chat) => (
              <div className={styles.chatHistoryItem} key={chat.id}>
                <button className={styles.chatHistoryButton} onClick={() => handleSelectChat(chat.id)}>
                  {chat.title}
                </button>
                <button className={styles.chatDeleteButton} onClick={() => handleDeleteChat(chat.id)}>
                  &#215;
                </button>
              </div>
            ))}
        </div>
      </aside>
      <section className={styles.chatWrapper}>
        <header className={styles.chatHeader}>Some chat title info here</header>
        <section className={styles.chatList}>
          {messages.map((message) => (
            <div className={`${styles.chatMessage} ${message.role === 'user' ? styles.isUser : ''}`} key={message.id}>
              <span className={styles.chatMessageAuthor}>
                {message.role === 'user' ? <UserCircle size={32} weight="light" /> : <Robot size={32} weight="light" />}
              </span>

              <div className={styles.chatMessageContent}>
                <MarkdownPreview source={message.content} />
              </div>
            </div>
          ))}

          {isLoading || isImageLoading ? (
            <div className={`${styles.chatMessage}`}>
              <span className={styles.chatMessageAuthor}>
                <Robot size={32} weight="light" />
              </span>

              <div className={styles.chatMessageContent}>Loading...</div>
            </div>
          ) : null}
        </section>
        <form className={styles.chatForm} onSubmit={handleSendMessage}>
          <textarea
            className={styles.chatInput}
            placeholder="Text your question here..."
            onChange={handleInputChange}
            value={input}
          ></textarea>
          <span className={styles.chatSendLegend}>&#9166; to Send / shift + &#9166; for New Line</span>
          <button className={styles.chatSendButton}>Send &#9166; </button>
        </form>
      </section>
    </main>
  )
}
