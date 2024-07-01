'use client'

import { FC, useMemo, useState } from 'react'
import { ChatsTeardrop, ChatText, TrashSimple } from '@phosphor-icons/react'
import { useMediaQuery } from 'usehooks-ts'

import styles from '@/components/styles.module.css'
import { Chat, useChatsStore } from '@/hooks/useChatStore'

interface AsideProps {
  loadChat: (chatId: string) => void
}

export const BullishLogo = () => (
  <svg className={styles.bullishLogo} fill="none" viewBox="0 0 579 299" xmlns="http://www.w3.org/2000/svg">
    <title>Bullish</title>
    <path
      d="M263.619 94.2131C226.143 63.9677 186.524 49.9167 136.19 42.8674C90.9524 36.5326 63.619 27.4828 23.9524 0L0 35.6752C35.5238 62.1102 68.8095 75.2085 113.905 83.0199C145.81 88.545 170.762 88.9261 203.952 106.549C197.429 115.028 191.476 127.507 187.857 135.985C171.286 126.173 146.857 118.648 114.238 118.314V160.8C130.095 161.467 144.333 163.42 163.524 171.755C186.905 181.901 203.19 197.095 203.19 197.095C221.857 131.508 263.619 94.2131 263.619 94.2131ZM368.333 149.798C334.048 175.28 312.667 213.527 306.905 255.919H271.714C291 101.739 432.667 87.8782 459.571 84.0678C508.143 77.209 542.952 62.1578 578.429 35.7229L554.476 0.0476188C514.81 27.5304 487.476 36.5802 442.238 42.915C391.905 49.9644 350.571 65.0632 313.095 95.3086C254.81 141.32 227.381 208.955 227.381 277.305L227.429 298.643H346.762V277.257C346.286 214.528 393.524 184.044 393.524 184.044C410.429 172.613 435.81 159.8 464.191 160.896V118.409C432.286 118.076 399.286 128.221 368.333 149.798Z"
      fill="currentColor"
    ></path>
  </svg>
)

export const Aside: FC<AsideProps> = ({ loadChat }) => {
  const [filter, setFilter] = useState('')
  const isLtTablet = useMediaQuery('(max-width: 960px)')

  const { chatList, deleteChat, newChat } = useChatsStore()

  const filteredChatList = useMemo(
    () =>
      Object.values(chatList).filter((chat) => chat.title?.toLocaleLowerCase().includes(filter.toLocaleLowerCase())),
    [chatList, filter]
  )

  const handleSelectChat = (chatId: string) => {
    loadChat(chatId)
  }

  return (
    <aside className={styles.aside} id="sideMenu" {...{ popover: isLtTablet ? 'auto' : undefined }}>
      <header className={styles.asideHeader}>
        <span className={styles.asideHeaderText}>
          <BullishLogo />
          Bullish GPT
        </span>
        <button
          className={styles.iconButton}
          onClick={newChat}
          {...{ popovertarget: 'sideMenu', popovertargetaction: 'hide' }}
        >
          <ChatText size={20} />
        </button>
      </header>
      <input
        type="search"
        placeholder="Search conversations"
        className={styles.chatHistorySearch}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className={styles.chatHistoryWrapper}>
        {filteredChatList.map((chat) => (
          <div className={styles.chatHistoryItem} key={chat.id}>
            <button
              className={styles.chatHistoryButton}
              onClick={() => handleSelectChat(chat.id)}
              {...{ popovertarget: 'sideMenu', popovertargetaction: 'hide' }}
            >
              <ChatsTeardrop size={16} />
              {chat.title}
            </button>
            <button className={styles.chatDeleteButton} onClick={() => deleteChat(chat.id)}>
              <TrashSimple size={16} weight="bold" />
            </button>
          </div>
        ))}
      </div>
      <button
        className={styles.asideNewChatButton}
        onClick={newChat}
        {...{ popovertarget: 'sideMenu', popovertargetaction: 'hide' }}
      >
        <ChatText size={20} /> New Chat
      </button>
    </aside>
  )
}
