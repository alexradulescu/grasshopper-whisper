'use client'

import { FormEvent, useCallback, useEffect, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'

import { Aside } from '@/components/aside'
import { ChatForm } from '@/components/chatForm'
import { MessagesArea } from '@/components/messagesArea'
import styles from '@/components/styles.module.css'
import { useChatsStore } from '@/hooks/useChatStore'
import { useFetch } from '@/hooks/useFetch'
import { useChat } from '@ai-sdk/react'
import { SidebarSimple } from '@phosphor-icons/react'

export default function Home() {
  const isGtTablet = useMediaQuery('(min-width: 768px)')

  const { selectedChatId, chatList, setSelectedChatId, addUpdateChat, setChatList, isStoreHydrated, updateTitle } =
    useChatsStore()
  const [finishedStream, setFinishedStream] = useState(false)
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, stop } = useChat({
    api: '/api/chat',
    body: {
      system: 'whisper'
    },
    onFinish: () => {
      setFinishedStream(true)
    }
  })

  const { fetchData } = useFetch<any>('api/completion', { messages })
  // TODO: Re-enable when image generation is ready
  // const [imageGenerator, setImageGenerator] = useState(false)
  // const { loading: isImageLoading, fetchData: fetchImage } = useFetch<any>('api/images', { prompt: input })

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

  const handleSendMessage = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (isLoading) {
        stop()
      } else {
        handleSubmit(e)
      }
      // TODO: Re-enable when image generation is ready
      // if (!imageGenerator) {
      //   handleSubmit(e)
      // } else {
      //   console.info(`IMAGE GEN`)
      //   const { url } = await fetchImage()
      //   console.info({ url })
      // }
    },
    [handleSubmit, stop, isLoading]
  )

  return (
    <main className={styles.main}>
      <Aside startNewChat={startNewChat} loadChat={loadChat} chatList={chatList} setChatList={setChatList} />
      <section className={styles.chatWrapper}>
        <header className={styles.chatHeader}>
          <span className={styles.chatTitle}>{selectedChatId ? chatList[selectedChatId]?.title : 'New Chat'}</span>
          {!isGtTablet ? (
            <button className={styles.iconButton} {...{ popovertarget: 'sideMenu' }}>
              <SidebarSimple size={20} />
            </button>
          ) : null}
        </header>

        <MessagesArea messages={messages} isLoading={isLoading} />
        <ChatForm
          handleSendMessage={handleSendMessage}
          handleInputChange={handleInputChange}
          input={input}
          isLoading={isLoading}
          stop={stop}
        />
      </section>
    </main>
  )
}
