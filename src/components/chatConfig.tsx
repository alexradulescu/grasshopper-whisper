'use client'

import { FC, memo } from 'react'
import { ChatText, RocketLaunch } from '@phosphor-icons/react'
import { useMediaQuery } from 'usehooks-ts'

import styles from '@/components/styles.module.css'
import { useChatsStore } from '@/hooks/useChatStore'

export const ChatConfig: FC = () => {
  const isLtTablet = useMediaQuery('(max-width: 960px)')

  const { chatList, updatePrompt, selectedChatId } = useChatsStore()

  return (
    <div className={styles.chatConfigWrapper} id="chatConfig" {...{ popover: isLtTablet ? 'auto' : undefined }}>
      <h3 className={styles.chatConfigHeadline}>Custom Prompt</h3>
      <textarea
        placeholder="Your custom prompt"
        className={styles.promptTextarea}
        value={chatList[selectedChatId]?.prompt || ''}
        onChange={(e) => updatePrompt(e.target.value, selectedChatId)}
      />
    </div>
  )
}

export const ChatConfigMemo = memo(ChatConfig)
