/* eslint-disable @next/next/no-img-element */
'use client'

import React, { FC, memo, useEffect, useRef, useState } from 'react'
import { UseChatHelpers } from '@ai-sdk/react'
import { ArrowDown, OpenAiLogo } from '@phosphor-icons/react'
import { Message } from 'ai'

import { MessageItemMemo } from './messageItem'
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
  finishedStream: boolean
  reload: UseChatHelpers['reload']
  error: boolean
}

const MessagesArea: FC<MessageAreaProps> = ({ messages, isLoading, finishedStream, reload, error }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true)

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (scrollElement) {
      if (isScrolledToBottom) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }

      /** When AI is streaming the response, we render the preview unformatted.
       * Once streaming finished, the answer gets formatted in MarkdownPreview, which changes the total height
       * and it isn't truly at the bottom (although isScrolledToBottom is true)
       * Then we scroll to the bottom again to make sure we are truly at the bottom.
       * If isScrolledToBottom is false, the user has scrolled up and we don't want to scroll them down forcefully
       */
      if (finishedStream && isScrolledToBottom) {
        scrollToBottom()
      }
    }
  }, [messages, isScrolledToBottom, finishedStream])

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
            <em>
              Please make sure to read the{' '}
              <a
                href="https://blockone.atlassian.net/wiki/spaces/B1/pages/2911010864/BullsAI+-+Acceptable+Use+Policy"
                rel="noopener noreferrer nofollow"
                target="_blank"
                title="Acceptable Use Policy"
              >
                Acceptable Use Policy here
              </a>
            </em>
            <br />
            <strong>Go Bullish ! 🖖✌️</strong>
          </p>
          `
        </div>
      ) : null}

      {messages.map((message, index) => (
        <MessageItemMemo
          key={message.id}
          {...message}
          isLastAgentMessageAndLoading={index === messages.length - 1 && message.role != 'user' && isLoading}
        />
      ))}

      {isLoading ? (
        <div className={styles.chatMessage}>
          <span className={styles.chatMessageAuthor}>
            <OpenAiLogo size={28} weight="light" />
          </span>

          <div className={`${styles.chatMessageContent} ${styles.isLoading}`}>Loading...</div>
        </div>
      ) : null}

      {error ? (
        <div className={styles.chatMessage}>
          <span className={styles.chatMessageAuthor}>
            <OpenAiLogo size={28} weight="light" />
          </span>

          <div className={`${styles.chatMessageContent} ${styles.hasError}`}>
            There was an error generating the response.
            <button className={styles.retryButton} onClick={() => reload()}>
              Click here to retry
            </button>
          </div>
        </div>
      ) : (
        <>No error</>
      )}

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

export const MessagesAreaMemo = memo(MessagesArea)
