/* eslint-disable @next/next/no-img-element */
'use client'

import React, { FC, useEffect, useRef, useState } from 'react'
import { ArrowDown, OpenAiLogo, UserCircle } from '@phosphor-icons/react'
import MarkdownPreview from '@uiw/react-markdown-preview'
import { Message } from 'ai'

import styles from './styles.module.css'

function getTimeBasedGreeting(): string {
  const currentHour = new Date().getHours()

  if (currentHour >= 5 && currentHour < 12) {
    return 'Good Morning'
  } else if (currentHour >= 12 && currentHour < 18) {
    return 'Good Afternoon'
  } else {
    return 'Good Evening'
  }
}

interface MessageAreaProps {
  messages: Message[]
  isLoading: boolean
}

export const MessagesArea: FC<MessageAreaProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      if (isScrolledToBottom) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages, isScrolledToBottom])

  const handleScroll = () => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1
      setIsScrolledToBottom(isBottom)
    }
  }

  const scrollToBottom = () => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: 'smooth'
      })
      setIsScrolledToBottom(true)
    }
  }

  return (
    <section className={styles.chatList} ref={scrollRef} onScroll={handleScroll}>
      {!messages.length ? (
        <div className={styles.emptyMessageWrapper}>
          <h3 className={styles.emptyMessageTitle}>
            <img
              className={styles.emptyMessageAnimation}
              alt="👋"
              loading="lazy"
              width="40"
              height="40"
              decoding="async"
              src="waving-hand.webp"
            />
            {getTimeBasedGreeting()}
          </h3>
          <p className={styles.emptyMessageSubtitle}>
            I&lsquo;m Bullish GPT, your AI conversation assistant. How can I help you?
            <br />
            You can ask me anything, I am running the latest ChatGPT(gpt-4omni) under the hood.
            {/* <br />
            I can also read most links you provide me (1 per message) for things like generic documentation and provide
            you code snippets. */}
            <br />
            <em>
              Please remember not to share any sensitive proprietary data in our chats and to double-check the answers,
              ChatGPT can make mistakes.
            </em>
            <br />
            <strong>Go Bullish ! 🖖✌️</strong>
          </p>
          `
        </div>
      ) : null}
      {messages.map((message) => (
        <div className={`${styles.chatMessage} ${message.role === 'user' ? styles.isUser : ''}`} key={message.id}>
          <span className={styles.chatMessageAuthor}>
            {message.role === 'user' ? (
              <UserCircle size={28} weight="light" />
            ) : (
              <OpenAiLogo size={28} weight="light" />
            )}
          </span>

          <div className={styles.chatMessageContent} data-color-mode="dark">
            <MarkdownPreview className={styles.chatMessageMarkdown} source={message.content} />
          </div>
        </div>
      ))}

      {isLoading ? (
        <div className={styles.chatMessage}>
          <span className={styles.chatMessageAuthor}>
            <OpenAiLogo size={32} weight="light" />
          </span>

          <div className={`${styles.chatMessageContent} ${styles.isLoading}`}>Loading...</div>
        </div>
      ) : null}

      {messages.length ? (
        <button
          className={`${styles.iconButton} ${styles.backToBottomButton} ${isScrolledToBottom ? styles.isHidden : undefined}`}
          onClick={scrollToBottom}
        >
          <ArrowDown size={20} />
        </button>
      ) : null}
    </section>
  )
}
