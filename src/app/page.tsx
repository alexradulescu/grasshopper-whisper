'use client'

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { SidebarSimple } from '@phosphor-icons/react'
import { useMediaQuery } from 'usehooks-ts'

import { ChatConfigMemo } from '@/components/chatConfig'
import { ChatFormMemo } from '@/components/chatForm'
import { BullishLogo, MainSidebarMemo } from '@/components/mainSidebar'
import { MessagesAreaMemo } from '@/components/messagesArea'
import styles from '@/components/styles.module.css'
import { useChatsStore } from '@/hooks/useChatStore'
import { useMutation } from '@/hooks/useMutation'

export default function Home() {
  const isLtTablet = useMediaQuery('(max-width: 960px)')
  const [errorState, setErrorState] = useState({
    hasError: false,
    selectedChatId: ''
  })

  /** In memory with localStorage persistance datastore */
  const { selectedChatId, chatList, setSelectedChatId, isStoreHydrated, updateTitle, addChatMessage, newChat } =
    useChatsStore()
  const [finishedStream, setFinishedStream] = useState(false)

  /** Using Vercel's useChat hook as it supports quite a wide variety of features
   * if we want to expand it further and it is very actively maintained */
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages, stop, reload } = useChat({
    api: '/api/chat',
    body: {
      userPrompt: chatList[selectedChatId]?.prompt || ''
    },
    onResponse: () => {
      /** Resetting error state when a new message is sent or retried */
      setErrorState({
        hasError: false,
        selectedChatId: selectedChatId
      })
    },
    onFinish: () => {
      setFinishedStream(true)
    },
    onError: (error) => {
      console.warn('Error:', error)
      setErrorState({
        hasError: true,
        selectedChatId: selectedChatId
      })
    },
    keepLastMessageOnError: true
  })

  /** Reset errorState when changing chat */
  useEffect(() => {
    if (errorState.selectedChatId !== selectedChatId) {
      setErrorState({
        hasError: false,
        selectedChatId: selectedChatId
      })
    }
  }, [errorState.selectedChatId, selectedChatId])

  /** Mutation to generate a conversation title based on the first user and ai message. */
  const updateTitleMutation = useMutation<{ title: string }, Error>({
    url: 'api/completion',
    onSuccess: (data) => {
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

  /** Adding messages to the history once the streaming finished (to prevent constant rerenders while streaming)
   * and generating a title if one wasn't generated already.
   * Not implementing this in the useChat onFinish because we don't have access to the full list of messages, causing issues with the history.
   */
  useEffect(() => {
    if (finishedStream) {
      addChatMessage(messages, selectedChatId)
      setFinishedStream(false)

      if (messages.length >= 2 && chatList[selectedChatId].title === 'New Chat') {
        updateTitleMutation.mutate({ messages })
      }
    }
  }, [finishedStream, addChatMessage, chatList, messages, selectedChatId, updateTitleMutation])

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
          <MainSidebarMemo loadChat={loadChat} />
          <section className={styles.chatWrapper}>
            <header className={styles.chatHeader}>
              <span className={styles.chatTitle}>{selectedChatId ? chatList[selectedChatId]?.title : 'New Chat'}</span>
              {isLtTablet ? (
                <button className={styles.iconButton} {...{ popovertarget: 'sideMenu' }}>
                  <SidebarSimple size={20} />
                </button>
              ) : null}
            </header>

            <MessagesAreaMemo
              messages={messages}
              isLoading={isLoading}
              finishedStream={finishedStream}
              reload={reload}
              error={errorState.hasError}
            />
            <ChatFormMemo
              handleSendMessage={handleSendMessage}
              handleInputChange={handleInputChange}
              input={input}
              isLoading={isLoading}
            />
          </section>
          <ChatConfigMemo />
        </>
      ) : (
        <h1 className={styles.mainLoading}>
          <BullishLogo /> Bullish GPT is loading...
        </h1>
      )}
    </main>
  )
}
