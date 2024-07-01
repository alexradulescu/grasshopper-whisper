'use client'

import { FormEvent, useCallback, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { SidebarSimple } from '@phosphor-icons/react'
import { useMediaQuery } from 'usehooks-ts'

import { Aside, BullishLogo } from '@/components/aside'
import { ChatForm } from '@/components/chatForm'
import { MessagesArea } from '@/components/messagesArea'
import styles from '@/components/styles.module.css'
import { useChatsStore } from '@/hooks/useChatStore'
import { useMutation } from '@/hooks/useMutation'

export default function Home() {
  const isGtTablet = useMediaQuery('(min-width: 768px)')

  /** In memory with localStorage persistance datastore */
  const { selectedChatId, chatList, setSelectedChatId, isStoreHydrated, updateTitle, addChatMessage, newChat } =
    useChatsStore()
  // const [finishedStream, setFinishedStream] = useState(false)

  /** Using Vercel's useChat hook as it supports quite a wide variety of features
   * if we want to expand it further and it is very actively maintained */
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, stop } = useChat({
    api: '/api/chat',
    body: {
      system: 'whisper'
    },
    onFinish: (newMessage) => {
      const updatesMessageList = [...messages, newMessage]
      addChatMessage(updatesMessageList, selectedChatId)

      if (updatesMessageList.length >= 2 && chatList[selectedChatId].title === 'New Chat') {
        updateTitleMutation.mutate({ updatesMessageList })
      }
    }
  })

  /** Mutation to generate a conversation title based on the first user and ai message. */
  const updateTitleMutation = useMutation<{ title: string }, Error>({
    url: 'api/completion',
    onSuccess: (data) => {
      console.info(data)
      updateTitle(data.title, selectedChatId)
    },
    onError: (error) => console.error('Error:', error)
  })
  // TODO: Re-enable when image generation is ready
  // const [imageGenerator, setImageGenerator] = useState(false)
  // const { loading: isImageLoading, fetchData: fetchImage } = useFetch<any>('api/images', { prompt: input })

  /** Load an existing chat when user clicks on one.
   * Holding selectedChat in memory for now for simplicity, might refactor to using router later on.
   * If no chat is selected (brand new user), a new chat is started.
   */
  const loadChat = useCallback(
    (chatId: string) => {
      if (Object.keys(chatList).includes(chatId)) {
        if (chatId !== selectedChatId) {
          setSelectedChatId(chatId)
        }
        setMessages(chatList[chatId].messages)
      }
    },
    [chatList, setMessages, setSelectedChatId, selectedChatId]
  )

  /** Waiting for the global store to be hydrated, otherwise we will miss the history and always start a new one
   * If user was on a chat previously, they will be directed back to it for now.
   */
  useEffect(() => {
    if (!isStoreHydrated) return

    if (selectedChatId === '') {
      newChat()
    }

    loadChat(selectedChatId)
  }, [selectedChatId, newChat, isStoreHydrated, loadChat]) // Ensures a new chat is started if no chat is selected

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
      {isStoreHydrated ? (
        <>
          <Aside loadChat={loadChat} />
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
        </>
      ) : (
        <h1 className={styles.mainLoading}>
          <BullishLogo /> Bullish GPT is loading...
        </h1>
      )}
    </main>
  )
}
