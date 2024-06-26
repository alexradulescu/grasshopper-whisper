'use client'

import React, { useRef, useEffect, useState, FC } from 'react';
import styles from './styles.module.css'
import { Message } from 'ai';
import { Robot, UserCircle } from '@phosphor-icons/react'
import MarkdownPreview from '@uiw/react-markdown-preview'


interface MessageAreaProps {
  messages: Message[];
  isLoading: boolean
}

export const MessagesArea: FC<MessageAreaProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      if (isScrolledToBottom) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isScrolledToBottom]);

  const handleScroll = () => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1;
      setIsScrolledToBottom(isBottom);
    }
  };

  return (
    <section className={styles.chatList}ref={scrollRef} onScroll={handleScroll}>
      {messages.map((message) => (
        <div className={`${styles.chatMessage} ${message.role === 'user' ? styles.isUser : ''}`} key={message.id}>
          <span className={styles.chatMessageAuthor}>
            {message.role === 'user' ? <UserCircle size={32} weight="light" /> : <Robot size={32} weight="light" />}
          </span>

          <div className={styles.chatMessageContent}>
            <MarkdownPreview  className={styles.chatMessageMarkdown} source={message.content}  />
          </div>
        </div>
      ))}

      {isLoading ? (
        <div className={`${styles.chatMessage}`}>
          <span className={styles.chatMessageAuthor}>
            <Robot size={32} weight="light" />
          </span>

          <div className={styles.chatMessageContent}>Loading...</div>
        </div>
      ) : null}
    </section>
  );
};

