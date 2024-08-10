'use client'

import { FC, memo } from 'react'
import { ChatsTeardrop, TrashSimple } from '@phosphor-icons/react'

import styles from '@/components/styles.module.css'
import { Chat } from '@/hooks/useChatStore'

interface Props extends Chat {
  handleSelectChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  isSelectedChat: boolean
}

const ChatHistoryItem: FC<Props> = ({ id, title, handleSelectChat, deleteChat, isSelectedChat }) => {
  return (
    <div className={styles.chatHistoryItem} data-is-active={isSelectedChat}>
      <button
        className={styles.chatHistoryButton}
        onClick={() => handleSelectChat(id)}
        {...{ popovertarget: 'sideMenu', popovertargetaction: 'hide' }}
      >
        <ChatsTeardrop size={16} />
        {title}
      </button>
      <button className={styles.chatDeleteButton} onClick={() => deleteChat(id)}>
        <TrashSimple size={16} weight="bold" />
      </button>
    </div>
  )
}

const areEqual = (prevProps: Props, nextProps: Props) => {
  return prevProps.isSelectedChat === nextProps.isSelectedChat && prevProps.title === nextProps.title
}

export const ChatHistoryItemMemo = memo(ChatHistoryItem, areEqual)
