/* eslint-disable @next/next/no-img-element */
'use client'

import React, { FC, memo } from 'react'
import { OpenAiLogo, UserCircle } from '@phosphor-icons/react'
import MarkdownPreview from '@uiw/react-markdown-preview'
import { Message } from 'ai'

import { useCleanHtmlCopy } from '@/hooks/useCleanHtmlCopy'

import styles from './styles.module.css'

interface Props extends Message {
  isLastAgentMessageAndLoading: boolean
}

const MarkdownPreviewMemo = memo(MarkdownPreview)

const MessageItem: FC<Props> = ({ role, content, isLastAgentMessageAndLoading }) => {
  useCleanHtmlCopy()

  return (
    <div className={`${styles.chatMessage} ${role === 'user' ? styles.isUser : ''}`}>
      <span className={styles.chatMessageAuthor}>
        {role === 'user' ? <UserCircle size={28} weight="light" /> : <OpenAiLogo size={28} weight="light" />}
      </span>

      <div className={styles.chatMessageContent}>
        {/* When the message is loading, MarkdownPreview re-renders too heavily, taking CPU >100%, freezing the UI for very large messages.
        So as a sto-gap measure we first render in <pre> and then once done it switches to MarkdownPreview */}
        {isLastAgentMessageAndLoading ? (
          <pre className={styles.chatMessagePreview}>{content}</pre>
        ) : (
          <MarkdownPreviewMemo className={styles.chatMessageMarkdown} source={content} />
        )}
      </div>
    </div>
  )
}

export const MessageItemMemo = memo(MessageItem)
